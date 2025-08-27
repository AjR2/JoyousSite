import json
from pathlib import Path
from threading import Lock

MANIFEST_PATH = Path(__file__).parent.parent / "agent_manifest.json"
_LOCK = Lock()

def load_agents():
    with _LOCK:
        if not MANIFEST_PATH.exists():
            return []
        with open(MANIFEST_PATH, "r") as f:
            return json.load(f)

def save_agents(agent_list):
    with _LOCK:
        with open(MANIFEST_PATH, "w") as f:
            json.dump(agent_list, f, indent=2)

def list_agents():
    return load_agents()

def add_agent(agent):
    agents = load_agents()
    # Ensure unique agent_id
    if any(a['agent_id'] == agent['agent_id'] for a in agents):
        raise ValueError(f"Agent with id {agent['agent_id']} already exists.")
    agents.append(agent)
    save_agents(agents)
    return agent
