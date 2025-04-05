# main.py
from fastapi import FastAPI 
from openai import OpenAI

from dotenv import load_dotenv
import os

import json

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/items")
def read_item(q: str = None):
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You will be provided with a sentence the sentence will have 3 parts,\n1. The target - written after '@' symbol.\n2. The subject - written after '#' symbol.\n3. The content - written at the end.\n\nseparate them in different json parts. \nGenerate a JSON object only. Do not include any markdown or code blocks. Return only raw JSON with keys: target, subject, and content."
            },
            {
                "role": "user",
                "content": "@hr #leave I am going to leave the company on 10 April 2023. Please let me know if you need any further information."
            }
        ],
        
    )
    json_string = completion.choices[0].message.content
    print(json_string)

    data = json.loads(json_string)

    # Now you can use it like a Python dict
    print(data["target"])   # Output: hr
    print(data["subject"])  # Output: leave
    print(data["content"])  # Output: the message

    return {"query": q}

