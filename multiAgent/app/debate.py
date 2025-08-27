from typing import List, Dict
from app.utils import call_agent_with_timeout

async def run_debate(prompt: str, agents: List[str], logger=None) -> Dict[str, str]:
    """Run a debate between multiple agents on a given topic."""
    viewpoints = {}
    for agent in agents:
        response = await call_agent_with_timeout(
            agent,
            f"Provide your perspective on: {prompt}",
            timeout=30,
            logger=logger
        )
        viewpoints[agent] = response

    # Have Claude synthesize the debate
    synthesis_prompt = f"""Here are different viewpoints on: {prompt}

Viewpoints:
{chr(10).join([f'{agent}: {view}' for agent, view in viewpoints.items()])}

Please synthesize these viewpoints into a balanced analysis."""

    synthesis = await call_agent_with_timeout(
        "claude",
        synthesis_prompt,
        timeout=45,
        logger=logger
    )

    return {
        "viewpoints": viewpoints,
        "synthesis": synthesis
    }
