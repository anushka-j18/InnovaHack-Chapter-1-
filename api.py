import os
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

# Load environment variables
load_dotenv()

from src.graph import app as graph_app
from src.report import export_pdf

app = FastAPI(title="Agentic Fact Checker API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    topic: str

@app.post("/api/research")
async def research(req: ResearchRequest):
    async def event_generator():
        try:
            # We use stream() to get events from the LangGraph execution
            stream = graph_app.stream({
                "topic": req.topic,
                "initial_claims": [],
                "resolved_claims": [],
                "final_report": "",
            }, stream_mode="updates")
            
            final_state = None
            
            for chunk in stream:
                # chunk is a dict like {"node_name": {...state...}}
                for node_name, state in chunk.items():
                    # Send an event to the frontend indicating which node just finished
                    yield {
                        "event": "node_update",
                        "data": json.dumps({"node": node_name})
                    }
                    final_state = state
                    
            # After the loop, the graph has finished
            if final_state:
                # Optionally save the markdown report (like main.py did)
                os.makedirs("outputs", exist_ok=True)
                report_md = final_state.get("final_report", "")
                with open("outputs/final_report.md", "w", encoding="utf-8") as f:
                    f.write(report_md)
                
                # Send the final state
                yield {
                    "event": "complete",
                    "data": json.dumps(final_state)
                }
            else:
                yield {
                    "event": "error",
                    "data": json.dumps({"detail": "Pipeline failed to produce final state."})
                }

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"detail": str(e)})
            }

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
