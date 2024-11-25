from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect
from connection_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/chat/{sender_id}/{receiver_id}")
async def websocket_endpoint(websocket: WebSocket, sender_id: str, receiver_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = {
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "message": data
            }
            # Broadcast message to all connected clients
            await manager.broadcast(message_data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
