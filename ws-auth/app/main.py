from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import requests
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

from websocket_routes import router
from totp_routes import router as totp_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(totp_router)


@app.get("/api/v2/health")
async def check_health():
    url = f"{BACKEND_URL}/api/v2/ping"

    try:
        response = requests.get(url)

        if response.status_code == 200 and response.text == "pong":
            return {"status": "Server is running smoothly!"}
        else:
            return {"status": "Server responded with an unexpected result."}

    except requests.exceptions.RequestException as e:
        return JSONResponse(status_code=503, content={"status": "Server is experiencing an outage right now."})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5130)