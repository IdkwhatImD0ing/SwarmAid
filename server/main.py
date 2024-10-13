from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
from socket_manager import ConnectionManager
from db import get_db
from agents import AgentSwarm


app = FastAPI()
origins = [
    "http://localhost:3000",  # Your React frontend
    # Add other origins if needed
    # "https://yourdomain.com",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allow these origins
    allow_credentials=True,         # Allow cookies, authorization headers, etc.
    allow_methods=["*"],            # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],            # Allow all headers
)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, client_id: Optional[str] = None):
    if client_id is None:
        client_id = websocket.query_params.get("client_id")

    if client_id is None:
        await websocket.close(code=4001)
        return
    # save this client into server memory
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            event = data["event"]
            swarm = AgentSwarm(db, manager, websocket)
            print(event)
            if event == "get_db":
                # Retrieve all calls from the database
                db = get_db()
                message = {
                    "event": "db_response",
                    "data": db,
                }
                
                # Send the calls data back to the client
                await manager.send_personal_message(
                    message,
                    websocket,
                )
            if event == "message":
                messages = data["messages"]
                response = swarm.run(messages, stream=True)

                for chunk in response:
                    if "content" in chunk and chunk['content']:
                        print(chunk['content'], end="", flush=True)
                        await manager.send_personal_message(
                            {
                                "event": "message_response",
                                "data": chunk['content'],
                             },
                            websocket,
                        )

    except WebSocketDisconnect:
        print("Disconnecting...", client_id)
        await manager.disconnect(client_id)
    except Exception as e:
        print("Error:", str(e))
        await manager.disconnect(client_id)