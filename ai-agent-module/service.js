import json
import os
import time
import uuid
from typing import Dict, List, Optional

import redis
from fastapi import FastAPI, Request, Response, BackgroundTasks
from pydantic import BaseModel

# Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
REDIS_QUEUE_KEY = "whatsapp_messages_queue"
REDIS_PROCESSING_CHANNEL = "llm_processing"
REDIS_STATUS_CHANNEL = "llm_status"

# Initialize Redis connection
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    decode_responses=True
)

# Initialize FastAPI
app = FastAPI(title="WhatsApp to LLM Processing API")

# Data models
class WhatsAppMessage(BaseModel):
    message_id: str
    from_number: str
    message_body: str
    timestamp: float
    media_url: Optional[str] = None


class LLMProcessingStatus(BaseModel):
    message_id: str
    llm_service_id: str
    status: str  # "started", "processing", "completed", "failed"
    timestamp: float
    result: Optional[Dict] = None
    error: Optional[str] = None


# WhatsApp webhook endpoint
@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    form_data = await request.form()
    
    # Extract WhatsApp message details from Twilio webhook
    message_sid = form_data.get("MessageSid", "")
    from_number = form_data.get("From", "")
    message_body = form_data.get("Body", "")
    media_url = form_data.get("MediaUrl0", None)
    
    # Create message object
    message = WhatsAppMessage(
        message_id=message_sid,
        from_number=from_number,
        message_body=message_body,
        timestamp=time.time(),
        media_url=media_url
    )
    
    # Add to Redis queue in background to avoid blocking
    background_tasks.add_task(add_message_to_queue, message)
    
    return Response(content="Message received", status_code=200)
