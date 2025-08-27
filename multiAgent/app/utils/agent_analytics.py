from typing import List, Dict, Optional
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from app.db import async_session
from app.models.agent_action import AgentAction

class AgentAnalytics:
    @staticmethod
    async def get_conversation_flow(conversation_id: str) -> List[Dict]:
        """Get the sequence of agent actions in a conversation."""
        async with async_session() as session:
            stmt = select(AgentAction).where(
                AgentAction.conversation_id == conversation_id
            ).order_by(AgentAction.timestamp)
            
            result = await session.execute(stmt)
            actions = result.scalars().all()
            
            return [{
                'agent_name': action.agent_name,
                'task_type': action.task_type,
                'status': action.status,
                'duration': action.duration,
                'error': action.error,
                'timestamp': action.timestamp
            } for action in actions]

    @staticmethod
    async def get_agent_performance_metrics(
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """Get performance metrics for each agent."""
        if not start_time:
            start_time = datetime.utcnow() - timedelta(days=7)  # Default to last 7 days
        if not end_time:
            end_time = datetime.utcnow()

        async with async_session() as session:
            # Base query conditions
            conditions = [
                AgentAction.timestamp.between(start_time, end_time)
            ]
            if user_id:
                conditions.append(AgentAction.user_id == user_id)

            # Get total calls per agent
            total_calls = select(
                AgentAction.agent_name,
                func.count().label('total_calls'),
                func.avg(AgentAction.duration).label('avg_duration'),
                func.count().filter(AgentAction.status == 'completed').label('successful_calls'),
                func.count().filter(AgentAction.status == 'error').label('error_calls'),
                func.count().filter(AgentAction.status == 'timeout').label('timeout_calls')
            ).where(
                and_(*conditions)
            ).group_by(
                AgentAction.agent_name
            )

            result = await session.execute(total_calls)
            metrics = {}
            
            for row in result:
                total = row.total_calls
                metrics[row.agent_name] = {
                    'total_calls': total,
                    'avg_duration': round(row.avg_duration, 2) if row.avg_duration else None,
                    'success_rate': round(row.successful_calls / total * 100, 2) if total > 0 else 0,
                    'error_rate': round(row.error_calls / total * 100, 2) if total > 0 else 0,
                    'timeout_rate': round(row.timeout_calls / total * 100, 2) if total > 0 else 0
                }
            
            return metrics

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
    import asyncio
    async def test_conversation_flow():
        try:
            from app.utils.agent_analytics import AgentAnalytics
        except ModuleNotFoundError:
            from __main__ import AgentAnalytics
        conversation_id = input("Enter a conversation_id to test get_conversation_flow: ")
        try:
            flow = await AgentAnalytics.get_conversation_flow(conversation_id)
            print("Conversation Flow:", flow)
        except Exception as e:
            print("Error during conversation flow test:", e)
    asyncio.run(test_conversation_flow())

    @staticmethod
    async def get_task_type_distribution(
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """Get distribution of task types and their success rates."""
        if not start_time:
            start_time = datetime.utcnow() - timedelta(days=7)
        if not end_time:
            end_time = datetime.utcnow()

        async with async_session() as session:
            conditions = [
                AgentAction.timestamp.between(start_time, end_time)
            ]
            if user_id:
                conditions.append(AgentAction.user_id == user_id)

            task_stats = select(
                AgentAction.task_type,
                AgentAction.agent_name,
                func.count().label('total'),
                func.avg(AgentAction.duration).label('avg_duration'),
                func.count().filter(AgentAction.status == 'completed').label('successful')
            ).where(
                and_(*conditions)
            ).group_by(
                AgentAction.task_type,
                AgentAction.agent_name
            )

            result = await session.execute(task_stats)
            distribution = {}
            
            for row in result:
                if row.task_type not in distribution:
                    distribution[row.task_type] = {
                        'total_calls': 0,
                        'agents': {},
                        'avg_duration': 0,
                        'success_rate': 0
                    }
                
                dist = distribution[row.task_type]
                dist['total_calls'] += row.total
                dist['agents'][row.agent_name] = {
                    'calls': row.total,
                    'avg_duration': round(row.avg_duration, 2) if row.avg_duration else None,
                    'success_rate': round(row.successful / row.total * 100, 2) if row.total > 0 else 0
                }
                
            return distribution

    @staticmethod
    async def get_common_errors(
        limit: int = 10,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Dict]:
        """Get most common error patterns."""
        if not start_time:
            start_time = datetime.utcnow() - timedelta(days=7)
        if not end_time:
            end_time = datetime.utcnow()

        async with async_session() as session:
            error_stats = select(
                AgentAction.error,
                AgentAction.agent_name,
                func.count().label('occurrence_count')
            ).where(
                and_(
                    AgentAction.status == 'error',
                    AgentAction.timestamp.between(start_time, end_time)
                )
            ).group_by(
                AgentAction.error,
                AgentAction.agent_name
            ).order_by(
                func.count().desc()
            ).limit(limit)

            result = await session.execute(error_stats)
            return [{
                'error': row.error,
                'agent': row.agent_name,
                'count': row.occurrence_count
            } for row in result]

    @staticmethod
    async def get_conversation_summary(conversation_id: str) -> Dict:
        """Get a summary of a specific conversation."""
        async with async_session() as session:
            # Get all actions in the conversation
            actions = await AgentAnalytics.get_conversation_flow(conversation_id)
            
            if not actions:
                return {'error': 'Conversation not found'}

            # Calculate metrics
            total_duration = sum(action['duration'] or 0 for action in actions)
            successful_actions = sum(1 for action in actions if action['status'] == 'completed')
            
            # Group actions by agent
            agent_contributions = {}
            for action in actions:
                agent = action['agent_name']
                if agent not in agent_contributions:
                    agent_contributions[agent] = {
                        'tasks': 0,
                        'successful': 0,
                        'total_duration': 0
                    }
                
                contrib = agent_contributions[agent]
                contrib['tasks'] += 1
                if action['status'] == 'completed':
                    contrib['successful'] += 1
                contrib['total_duration'] += action['duration'] or 0

            return {
                'conversation_id': conversation_id,
                'total_actions': len(actions),
                'successful_actions': successful_actions,
                'total_duration': round(total_duration, 2),
                'success_rate': round(successful_actions / len(actions) * 100, 2),
                'agent_contributions': agent_contributions,
                'action_sequence': actions
            }
