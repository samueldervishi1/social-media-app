import asyncio
import datetime
import os

import httpx
import motor.motor_asyncio
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from totp_routes import router as totp_router

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


async def save_health_status_for_day(date: str, message: str):
    existing_doc = await health_collection.find_one({"date": date})

    if existing_doc:
        last_check_time = existing_doc['health_checks'][-1]['timestamp']
        last_check_time = datetime.datetime.strptime(last_check_time, "%Y-%m-%d %H:%M")
        current_time = datetime.datetime.utcnow()
        if (current_time - last_check_time).total_seconds() < 1800:
            print(f"Duplicate health check attempt detected for {date}. Skipping save.")
            return

    health_record = {
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "message": message
    }

    if existing_doc:
        await health_collection.update_one(
            {"date": date},
            {"$push": {"health_checks": health_record}}
        )
    else:
        new_doc = {
            "date": date,
            "health_checks": [health_record]
        }
        await health_collection.insert_one(new_doc)

    print(f"Health check saved for {date}: {message}")


@app.get("/api/v2/health")
async def check_health():
    url = f"{BACKEND_URL}/api/v2/ping"
    print(f"Making request to: {url}")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)

        print(f"Response Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")

        status = "Server is reachable" if response.status_code == 200 else "Server responded with an unexpected result"
        details = response.text if response.status_code != 200 else None

        current_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        message = f"{status} at {datetime.datetime.utcnow().strftime('%H:%M')}"
        await save_health_status_for_day(current_date, message)

        return {"status": status, "details": details or ""}

    except httpx.RequestError as e:
        status = "Server is experiencing an outage right now"
        message = f"{status} at {datetime.datetime.utcnow().strftime('%H:%M')}"
        current_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        await save_health_status_for_day(current_date, message)

        return JSONResponse(status_code=503, content={"status": status, "details": str(e)})


async def periodic_health_check():
    while True:
        await check_health()
        await asyncio.sleep(1800)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_health_check())


app.include_router(totp_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5130)