from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Message(BaseModel):
    content: str

@app.post("/receive")
async def receive_message(message: Message):
    # Here you can process the incoming message as needed
    print("Received message:", message.content)
    return {"status": "Message received"}
