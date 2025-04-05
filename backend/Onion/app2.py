from fastapi import FastAPI
import httpx
from pydantic import BaseModel

app = FastAPI()

class Message(BaseModel):
    content: str

@app.get("/send")
async def send_message():
    message = {"content": "Hello from app1!"}
    # Using an asynchronous HTTP client to post the message to app2
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:8000/receive", json=message)
    return {"status": "Message sent", "response": response.json()}
