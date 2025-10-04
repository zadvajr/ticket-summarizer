import os
from flask import Flask, request
from flask.templating import render_template
from typing import Any, Dict
from google import genai
import re
import json

app = Flask(__name__,static_folder="static",static_url_path="",template_folder="static")

if not os.getenv("GEMINI_API_KEY"):
    print("GEMINI_API_KEY env is required")
    exit()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.get("/")
def index_page(): return render_template('index.html')

@app.post("/api/summarize")
def summarize():
    """
    Summarizes a ticket
    """
    data: Any = request.json

    summary = get_summary(data.get("content"),data.get("summary_type"),data.get("priority"))
    return summary

def get_summary(content:str, format: str, priority:str):
    prompt = f'''
    You are a support assistant tasked with summarizing tickets.
    Here is the ticket content:
    {content}

    The summary input should follow these rules:
    - Format: {format} (options: brief, detailed, or bullet points).
    - Priority: {priority} (options: urgent, high, medium, low, or auto detect).
        - If "auto detect," infer the priority based on urgency, impact, and customer sentiment.

    Instructions:
    1. Focus only on the key issue(s), relevant context, and any actions taken or requested.
    2. Be concise, clear, and avoid unnecessary repetition.
    3. If priority is auto-detected, state the detected priority.
    4. Ensure the summary is ready for quick triage by support teams.
    5. Determine an appropriate [SENTIMENT] from the following list (positive: [happy, excellent, good, pleased, satisfies], negative: [angry, frustrated, terrible, awful, disappointed])
    6. Determine an appropriate one word [CATEGORY]

    provide the summary as a raw JSON object. The structure of the JSON should be the following:
    ```
    {{
        "summary": "[SUMMARY]",
        "category":"[CATEGORY]",
        "sentiment":"[SENTIMENT]",
        "priority": "[PRIORITY]"
    }}
    ```
    '''
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return extract_json(response.text)


def extract_json(blob: str | None)->Dict:
    if not blob: return {}
    json_match = re.search(r"```json\s*(.*?)\s*```", blob, re.DOTALL)
    if json_match:
        extracted_json_str = json_match.group(1)
        return json.loads(extracted_json_str)
    else:
        print("No JSON found within ```json``` markers.")
        return {}