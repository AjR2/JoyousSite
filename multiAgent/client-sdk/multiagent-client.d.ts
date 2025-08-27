/**
 * TypeScript definitions for Multi-Agent System Client SDK
 */

export interface MultiAgentClientOptions {
    timeout?: number;
    retries?: number;
    [key: string]: any;
}

export interface QualityAssessment {
    confidence_score: number;
    coherence_score: number;
    completeness_score: number;
    content_flags: string[];
    word_count: number;
}

export interface ContradictionReport {
    contradictions_found: number;
    severity_level: 'none' | 'low' | 'medium' | 'high';
    confidence_in_detection: number;
}

export interface ExecutionSummary {
    total_tasks: number;
    successful_tasks: number;
    failed_tasks: number;
    completion_rate: number;
    total_execution_time: number;
    retries_performed: number;
}

export interface AskResponse {
    'Final Response': string;
    'Quality Assessment': QualityAssessment;
    'Task Type': string;
    'Agent Used': string;
}

export interface CollaborateResponse {
    'Task Breakdown': string;
    'Initial Explanation': string;
    'Fact Check': string;
    'Final Response': string;
    'Quality Assessments': Record<string, QualityAssessment>;
    'Contradiction Report': ContradictionReport;
    'Execution Summary': ExecutionSummary;
    'Confidence Scores': Record<string, number>;
}

export interface PatientInfo {
    name?: string;
    age?: number;
    concerns?: string;
    insurance?: Record<string, any>;
}

export interface HealthcareOptions {
    sessionTranscript?: string;
    patientInfo?: PatientInfo;
}

export interface HealthcareResponse {
    final_response?: any;
    trace: Array<{
        agent: string;
        output: any;
        skipped?: boolean;
    }>;
    request_info?: string;
    stage?: 'intake' | 'triage' | 'scheduler' | 'completed';
}

export interface BatchQuery {
    type: 'ask' | 'collaborate' | 'healthcare';
    prompt?: string;
    taskType?: string;
    userId: string;
    userMessage?: string;
    options?: HealthcareOptions;
}

export type TaskType = 'explanation' | 'fact_check' | 'code_generation' | 'task_breakdown' | 'final_synthesis';

export declare class MultiAgentClient {
    constructor(baseUrl?: string, options?: MultiAgentClientOptions);
    
    ask(prompt: string, taskType?: TaskType, userId?: string): Promise<AskResponse>;
    
    collaborate(prompt: string, userId?: string): Promise<CollaborateResponse>;
    
    healthcare(userId: string, userMessage: string, options?: HealthcareOptions): Promise<HealthcareResponse>;
    
    batch(queries: BatchQuery[]): Promise<PromiseSettledResult<any>[]>;
    
    stream(prompt: string, userId: string, onUpdate?: (data: any) => void): Promise<CollaborateResponse>;
}

export interface UseMultiAgentReturn {
    client: MultiAgentClient;
    ask: (prompt: string, taskType?: TaskType, userId?: string) => Promise<AskResponse>;
    collaborate: (prompt: string, userId?: string) => Promise<CollaborateResponse>;
    healthcare: (userId: string, userMessage: string, options?: HealthcareOptions) => Promise<HealthcareResponse>;
    loading: boolean;
    error: string | null;
}

export declare function useMultiAgent(baseUrl?: string, options?: MultiAgentClientOptions): UseMultiAgentReturn;
