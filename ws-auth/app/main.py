import asyncio
import datetime
import os
import requests
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")
DB_URL = os.getenv("DB_URL")
DB_NAME = os.getenv("DB_NAME")

client = motor.motor_asyncio.AsyncIOMotorClient(DB_URL)
db = client[DB_NAME]
health_collection = db["health_status"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def save_health_status(status: str, details: str):
    health_record = {
        "status": status,
        "details": details,
        "timestamp": datetime.datetime.utcnow(),
    }
    print(f"Saving health status: {status}, {details}")
    result = await health_collection.insert_one(health_record)
    print(f"Inserted health record with ID: {result.inserted_id}")


@app.get("/api/v2/health")
async def check_health(background_tasks: BackgroundTasks):
    url = f"{BACKEND_URL}/api/v2/ping"
    print(f"Making request to: {url}")
    try:
        response = requests.get(url)
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.status_code == 200:
            status = "Server is running smoothly!"
            details = response.text
        else:
            status = "Server responded with an unexpected result."
            details = response.text

        background_tasks.add_task(save_health_status, status, details)

        return {"status": status, "details": details}

    except requests.exceptions.RequestException as e:
        status = "Server is experiencing an outage right now."
        details = str(e)

        background_tasks.add_task(save_health_status, status, details)

        return JSONResponse(status_code=503, content={"status": status, "details": details})


@app.get("/api/v2/health-history")
async def get_health_history():
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    health_records = await health_collection.find({"timestamp": {"$gte": seven_days_ago}}).to_list(length=7)

    formatted_records = [
        {
            "date": record["timestamp"].strftime("%d %b %Y"),
            "status": record["status"],
            "details": record["details"],
        }
        for record in health_records
    ]

    return {"history": formatted_records}


async def periodic_health_check():
    while True:
        await check_health(BackgroundTasks())
        await asyncio.sleep(300)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_health_check())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5130)