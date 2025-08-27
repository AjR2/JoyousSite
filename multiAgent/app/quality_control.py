"""
Enhanced Quality Control System for Multi-Agent Responses

This module provides advanced quality control mechanisms including:
- Improved confidence scoring
- Enhanced contradiction detection
- Response synthesis optimization
- Content validation and filtering
"""

import re
import asyncio
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import difflib
from app.llms import ask_claude, ask_gpt
from app.config import config

class ConfidenceLevel(Enum):
    VERY_LOW = 0.0
    LOW = 0.3
    MEDIUM = 0.6
    HIGH = 0.8
    VERY_HIGH = 0.95

@dataclass
class QualityMetrics:
    """Comprehensive quality metrics for a response"""
    confidence_score: float
    coherence_score: float
    completeness_score: float
    accuracy_indicators: Dict[str, float]
    content_flags: List[str]
    word_count: int
    readability_score: float

@dataclass
class ContradictionReport:
    """Detailed contradiction analysis between responses"""
    contradictions_found: List[Dict[str, Any]]
    severity_level: str  # "low", "medium", "high"
    resolution_suggestion: str
    confidence_in_detection: float

class EnhancedQualityController:
    """Advanced quality control system for multi-agent responses"""
    
    def __init__(self):
        self.confidence_weights = {
            'length': 0.15,
            'uncertainty_markers': 0.25,
            'specificity': 0.20,
            'structure': 0.15,
            'task_alignment': 0.25
        }
        
        self.uncertainty_phrases = [
            "i'm not sure", "uncertain", "unclear", "might be", "could be",
            "possibly", "perhaps", "i don't know", "not certain", "can't determine",
            "insufficient information", "hard to say", "difficult to determine",
            "i think", "i believe", "seems like", "appears to", "probably"
        ]
        
        self.confidence_boosters = [
            "confirmed", "verified", "established", "proven", "demonstrated",
            "clearly", "definitely", "certainly", "undoubtedly", "precisely",
            "specifically", "exactly", "research shows", "studies indicate"
        ]
    
    async def comprehensive_quality_assessment(
        self, 
        response: str, 
        task_type: str, 
        original_prompt: str,
        context: Optional[str] = None
    ) -> QualityMetrics:
        """Perform comprehensive quality assessment of a response"""
        
        # Calculate individual quality components
        confidence_score = await self.enhanced_confidence_scoring(response, task_type, original_prompt)
        coherence_score = self.assess_coherence(response)
        completeness_score = self.assess_completeness(response, original_prompt, task_type)
        accuracy_indicators = await self.assess_accuracy_indicators(response, task_type)
        content_flags = self.detect_content_issues(response)
        readability_score = self.assess_readability(response)
        
        return QualityMetrics(
            confidence_score=confidence_score,
            coherence_score=coherence_score,
            completeness_score=completeness_score,
            accuracy_indicators=accuracy_indicators,
            content_flags=content_flags,
            word_count=len(response.split()),
            readability_score=readability_score
        )
    
    async def enhanced_confidence_scoring(
        self, 
        response: str, 
        task_type: str, 
        original_prompt: str
    ) -> float:
        """Enhanced confidence scoring with multiple factors"""
        
        scores = {}
        
        # Length-based confidence (normalized)
        word_count = len(response.split())
        if task_type == "code_generation":
            optimal_length = 200  # Code responses can be shorter but complete
        elif task_type == "explanation":
            optimal_length = 300
        elif task_type == "fact_check":
            optimal_length = 150
        else:
            optimal_length = 250
        
        length_ratio = min(word_count / optimal_length, 1.0)
        scores['length'] = length_ratio * 0.8 + 0.2  # Scale to 0.2-1.0
        
        # Uncertainty markers (inverted - fewer uncertainty markers = higher confidence)
        uncertainty_count = sum(1 for phrase in self.uncertainty_phrases 
                              if phrase in response.lower())
        uncertainty_density = uncertainty_count / max(word_count / 100, 1)  # Per 100 words
        scores['uncertainty_markers'] = max(0.0, 1.0 - (uncertainty_density * 0.3))
        
        # Confidence boosters
        booster_count = sum(1 for phrase in self.confidence_boosters 
                           if phrase in response.lower())
        booster_density = booster_count / max(word_count / 100, 1)
        scores['uncertainty_markers'] = min(1.0, scores['uncertainty_markers'] + (booster_density * 0.2))
        
        # Specificity (presence of numbers, dates, specific terms)
        specificity_indicators = len(re.findall(r'\b\d+\b', response))  # Numbers
        specificity_indicators += len(re.findall(r'\b\d{4}\b', response))  # Years
        specificity_indicators += len(re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', response))  # Proper names
        scores['specificity'] = min(1.0, specificity_indicators / 10)
        
        # Structure (presence of lists, clear organization)
        structure_score = 0.5  # Base score
        if re.search(r'^\s*[-*•]\s', response, re.MULTILINE):  # Bullet points
            structure_score += 0.2
        if re.search(r'^\s*\d+\.\s', response, re.MULTILINE):  # Numbered lists
            structure_score += 0.2
        if len(re.findall(r'\n\s*\n', response)) > 1:  # Paragraph breaks
            structure_score += 0.1
        scores['structure'] = min(1.0, structure_score)
        
        # Task alignment (use LLM to assess how well response addresses the prompt)
        scores['task_alignment'] = await self.assess_task_alignment(response, original_prompt, task_type)
        
        # Calculate weighted average
        total_score = sum(scores[key] * self.confidence_weights[key] 
                         for key in scores)
        
        return max(0.0, min(1.0, total_score))
    
    async def assess_task_alignment(self, response: str, prompt: str, task_type: str) -> float:
        """Use LLM to assess how well the response addresses the original prompt"""
        try:
            assessment_prompt = f"""
            Evaluate how well this response addresses the given prompt for a {task_type} task.
            
            Original Prompt: "{prompt}"
            Response: "{response[:1000]}..."  # Truncate for efficiency
            
            Rate the alignment on a scale of 0.0 to 1.0 where:
            - 1.0 = Perfectly addresses all aspects of the prompt
            - 0.8 = Addresses most aspects well
            - 0.6 = Addresses some aspects adequately
            - 0.4 = Partially addresses the prompt
            - 0.2 = Barely addresses the prompt
            - 0.0 = Does not address the prompt at all
            
            Respond with only a number between 0.0 and 1.0.
            """
            
            result = await ask_claude(assessment_prompt)
            # Extract number from response
            score_match = re.search(r'([0-1]\.?\d*)', result)
            if score_match:
                return float(score_match.group(1))
            return 0.5  # Default if parsing fails
        except Exception:
            return 0.5  # Default fallback
    
    def assess_coherence(self, response: str) -> float:
        """Assess the logical coherence and flow of the response"""
        sentences = re.split(r'[.!?]+', response)
        if len(sentences) < 2:
            return 0.8  # Short responses are generally coherent
        
        coherence_score = 0.7  # Base score
        
        # Check for transition words/phrases
        transition_words = [
            'however', 'therefore', 'furthermore', 'moreover', 'additionally',
            'consequently', 'meanwhile', 'similarly', 'in contrast', 'for example',
            'specifically', 'in particular', 'as a result', 'on the other hand'
        ]
        
        transition_count = sum(1 for word in transition_words 
                             if word in response.lower())
        coherence_score += min(0.2, transition_count * 0.05)
        
        # Penalize for repetitive content
        words = response.lower().split()
        unique_words = set(words)
        repetition_ratio = len(unique_words) / max(len(words), 1)
        coherence_score *= repetition_ratio
        
        return min(1.0, coherence_score)
    
    def assess_completeness(self, response: str, prompt: str, task_type: str) -> float:
        """Assess how complete the response is for the given task type"""
        completeness_score = 0.5  # Base score
        
        # Task-specific completeness checks
        if task_type == "explanation":
            # Look for examples, definitions, context
            if "example" in response.lower() or "for instance" in response.lower():
                completeness_score += 0.2
            if len(response.split()) > 100:  # Sufficient detail
                completeness_score += 0.2
            if "because" in response.lower() or "due to" in response.lower():
                completeness_score += 0.1  # Explanatory content
        
        elif task_type == "fact_check":
            # Look for verification language, sources, specific claims
            verification_terms = ["verified", "confirmed", "according to", "source", "study"]
            if any(term in response.lower() for term in verification_terms):
                completeness_score += 0.3
        
        elif task_type == "code_generation":
            # Look for code blocks, comments, explanations
            if "```" in response or "def " in response or "function" in response:
                completeness_score += 0.3
            if "#" in response or "//" in response:  # Comments
                completeness_score += 0.1
        
        # General completeness indicators
        if len(response.split()) > 50:  # Minimum detail threshold
            completeness_score += 0.1
        
        return min(1.0, completeness_score)
    
    async def assess_accuracy_indicators(self, response: str, task_type: str) -> Dict[str, float]:
        """Assess various accuracy indicators in the response"""
        indicators = {}
        
        # Factual consistency (look for contradictory statements)
        indicators['internal_consistency'] = self.check_internal_consistency(response)
        
        # Citation quality (if citations are present)
        indicators['citation_quality'] = self.assess_citation_quality(response)
        
        # Specificity vs vagueness
        indicators['specificity'] = self.assess_specificity(response)
        
        return indicators
    
    def check_internal_consistency(self, response: str) -> float:
        """Check for internal contradictions within the response"""
        sentences = re.split(r'[.!?]+', response)
        if len(sentences) < 2:
            return 1.0
        
        # Simple heuristic: look for contradictory terms in the same response
        contradictory_pairs = [
            ('always', 'never'), ('all', 'none'), ('increase', 'decrease'),
            ('positive', 'negative'), ('true', 'false'), ('correct', 'incorrect')
        ]
        
        response_lower = response.lower()
        contradictions = 0
        
        for pair in contradictory_pairs:
            if pair[0] in response_lower and pair[1] in response_lower:
                # Check if they're in different contexts (simple distance check)
                pos1 = response_lower.find(pair[0])
                pos2 = response_lower.find(pair[1])
                if abs(pos1 - pos2) < 200:  # Close proximity suggests potential contradiction
                    contradictions += 1
        
        consistency_score = max(0.0, 1.0 - (contradictions * 0.3))
        return consistency_score
    
    def assess_citation_quality(self, response: str) -> float:
        """Assess the quality of citations if present"""
        # Look for citation patterns
        citations = re.findall(r'\[(\d+)\]', response)  # [1], [2], etc.
        urls = re.findall(r'https?://\S+', response)
        
        if not citations and not urls:
            return 0.5  # Neutral score for no citations
        
        citation_score = 0.3  # Base score for having citations
        
        # Quality indicators
        if len(citations) > 0:
            citation_score += 0.3
        if len(urls) > 0:
            citation_score += 0.2
        if len(set(citations)) == len(citations):  # No duplicate citations
            citation_score += 0.2
        
        return min(1.0, citation_score)
    
    def assess_specificity(self, response: str) -> float:
        """Assess how specific vs vague the response is"""
        # Count specific indicators
        numbers = len(re.findall(r'\b\d+\.?\d*\b', response))
        dates = len(re.findall(r'\b\d{4}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b', response))
        proper_nouns = len(re.findall(r'\b[A-Z][a-z]+\b', response))
        
        # Count vague terms
        vague_terms = ['some', 'many', 'few', 'several', 'various', 'often', 'sometimes', 'usually']
        vague_count = sum(1 for term in vague_terms if term in response.lower())
        
        specificity_score = (numbers + dates + proper_nouns) / max(len(response.split()) / 20, 1)
        vagueness_penalty = vague_count / max(len(response.split()) / 50, 1)
        
        return max(0.0, min(1.0, specificity_score - vagueness_penalty))
    
    def assess_readability(self, response: str) -> float:
        """Simple readability assessment"""
        sentences = len(re.split(r'[.!?]+', response))
        words = len(response.split())
        
        if sentences == 0:
            return 0.0
        
        avg_sentence_length = words / sentences
        
        # Optimal sentence length is around 15-20 words
        if 10 <= avg_sentence_length <= 25:
            readability = 1.0
        elif avg_sentence_length < 10:
            readability = 0.7  # Too short might be choppy
        else:
            readability = max(0.3, 1.0 - ((avg_sentence_length - 25) * 0.02))
        
        return readability
    
    def detect_content_issues(self, response: str) -> List[str]:
        """Detect potential content issues in the response"""
        flags = []
        
        # Check for excessive repetition
        words = response.lower().split()
        word_freq = {}
        for word in words:
            if len(word) > 3:  # Only check meaningful words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        max_freq = max(word_freq.values()) if word_freq else 0
        if max_freq > len(words) * 0.1:  # More than 10% repetition
            flags.append("excessive_repetition")
        
        # Check for placeholder text
        placeholders = ['[placeholder]', 'todo', 'tbd', 'xxx', '...']
        if any(placeholder in response.lower() for placeholder in placeholders):
            flags.append("placeholder_content")
        
        # Check for extremely short responses
        if len(response.strip()) < 20:
            flags.append("too_short")
        
        # Check for extremely long responses
        if len(response) > 5000:
            flags.append("too_long")
        
        return flags

    async def enhanced_contradiction_detection(
        self,
        agent_outputs: Dict[str, str]
    ) -> ContradictionReport:
        """Enhanced contradiction detection between multiple agent outputs"""

        contradictions = []
        agent_names = list(agent_outputs.keys())

        # Compare each pair of agent outputs
        for i in range(len(agent_names)):
            for j in range(i + 1, len(agent_names)):
                agent1, agent2 = agent_names[i], agent_names[j]
                output1, output2 = agent_outputs[agent1], agent_outputs[agent2]

                # Skip empty outputs
                if not output1.strip() or not output2.strip():
                    continue

                contradiction = await self.detect_pairwise_contradiction(
                    agent1, output1, agent2, output2
                )

                if contradiction:
                    contradictions.append(contradiction)

        # Determine overall severity
        if not contradictions:
            severity = "none"
        elif len(contradictions) == 1:
            severity = "low"
        elif len(contradictions) <= 3:
            severity = "medium"
        else:
            severity = "high"

        # Generate resolution suggestion
        resolution = await self.generate_contradiction_resolution(contradictions, agent_outputs)

        return ContradictionReport(
            contradictions_found=contradictions,
            severity_level=severity,
            resolution_suggestion=resolution,
            confidence_in_detection=self.calculate_detection_confidence(contradictions)
        )

    async def detect_pairwise_contradiction(
        self,
        agent1: str,
        output1: str,
        agent2: str,
        output2: str
    ) -> Optional[Dict[str, Any]]:
        """Detect contradictions between two specific agent outputs"""

        # Semantic similarity check
        similarity = self.calculate_semantic_similarity(output1, output2)

        # If outputs are very similar, unlikely to contradict
        if similarity > 0.8:
            return None

        # Use LLM to detect semantic contradictions
        contradiction_prompt = f"""
        Analyze these two responses for contradictions:

        Response A ({agent1}): "{output1[:500]}..."
        Response B ({agent2}): "{output2[:500]}..."

        Look for:
        1. Factual contradictions (different claims about the same thing)
        2. Logical contradictions (mutually exclusive statements)
        3. Conflicting recommendations or conclusions

        If contradictions exist, respond with JSON:
        {{"contradiction_found": true, "type": "factual|logical|recommendation", "description": "brief description", "severity": "low|medium|high"}}

        If no contradictions, respond with:
        {{"contradiction_found": false}}
        """

        try:
            result = await ask_claude(contradiction_prompt)
            # Parse JSON response
            import json
            contradiction_data = json.loads(result.strip())

            if contradiction_data.get("contradiction_found"):
                return {
                    "agent1": agent1,
                    "agent2": agent2,
                    "type": contradiction_data.get("type", "unknown"),
                    "description": contradiction_data.get("description", ""),
                    "severity": contradiction_data.get("severity", "medium"),
                    "similarity_score": similarity
                }
        except Exception as e:
            # Fallback to heuristic detection
            return self.heuristic_contradiction_detection(agent1, output1, agent2, output2)

        return None

    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        # Simple implementation using difflib
        # In production, you might want to use embeddings
        return difflib.SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

    def heuristic_contradiction_detection(
        self,
        agent1: str,
        output1: str,
        agent2: str,
        output2: str
    ) -> Optional[Dict[str, Any]]:
        """Fallback heuristic contradiction detection"""

        # Look for explicit contradictory terms
        contradictory_patterns = [
            (r'\b(true|correct|accurate)\b', r'\b(false|incorrect|inaccurate)\b'),
            (r'\b(increase|rise|grow)\b', r'\b(decrease|fall|shrink)\b'),
            (r'\b(safe|secure)\b', r'\b(dangerous|risky|unsafe)\b'),
            (r'\b(effective|successful)\b', r'\b(ineffective|unsuccessful)\b'),
            (r'\b(recommend|suggest)\b.*\b(yes|do)\b', r'\b(recommend|suggest)\b.*\b(no|don\'t)\b')
        ]

        output1_lower = output1.lower()
        output2_lower = output2.lower()

        for positive_pattern, negative_pattern in contradictory_patterns:
            if (re.search(positive_pattern, output1_lower) and
                re.search(negative_pattern, output2_lower)) or \
               (re.search(negative_pattern, output1_lower) and
                re.search(positive_pattern, output2_lower)):

                return {
                    "agent1": agent1,
                    "agent2": agent2,
                    "type": "heuristic",
                    "description": f"Detected contradictory terms: {positive_pattern} vs {negative_pattern}",
                    "severity": "medium",
                    "similarity_score": self.calculate_semantic_similarity(output1, output2)
                }

        return None

    async def generate_contradiction_resolution(
        self,
        contradictions: List[Dict[str, Any]],
        agent_outputs: Dict[str, str]
    ) -> str:
        """Generate a resolution suggestion for detected contradictions"""

        if not contradictions:
            return "No contradictions detected."

        resolution_prompt = f"""
        Multiple AI agents provided responses that contain contradictions. Please provide a balanced resolution.

        Contradictions detected:
        {chr(10).join([f"- {c['agent1']} vs {c['agent2']}: {c['description']}" for c in contradictions])}

        Agent responses:
        {chr(10).join([f"{agent}: {output[:200]}..." for agent, output in agent_outputs.items()])}

        Provide a resolution that:
        1. Acknowledges the contradictions
        2. Attempts to reconcile different viewpoints where possible
        3. Identifies which information is most reliable
        4. Suggests areas where more information might be needed

        Keep the resolution concise but comprehensive.
        """

        try:
            resolution = await ask_claude(resolution_prompt)
            return resolution
        except Exception:
            return "Unable to generate automatic resolution. Manual review recommended."

    def calculate_detection_confidence(self, contradictions: List[Dict[str, Any]]) -> float:
        """Calculate confidence in contradiction detection"""
        if not contradictions:
            return 1.0  # High confidence in no contradictions

        # Base confidence decreases with more contradictions (might indicate noise)
        base_confidence = max(0.3, 1.0 - (len(contradictions) * 0.1))

        # Adjust based on contradiction types and severity
        severity_weights = {"low": 0.8, "medium": 1.0, "high": 1.2}
        avg_severity_weight = sum(severity_weights.get(c.get("severity", "medium"), 1.0)
                                 for c in contradictions) / len(contradictions)

        return min(1.0, base_confidence * avg_severity_weight)

# Global quality controller instance
quality_controller = EnhancedQualityController()
