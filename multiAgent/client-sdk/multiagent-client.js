/**
 * Multi-Agent System Client SDK
 * Lightweight JavaScript client for interacting with the Multi-Agent API
 */

class MultiAgentClient {
    constructor(baseUrl = '', options = {}) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.options = {
            timeout: 60000, // 60 seconds default timeout
            retries: 2,
            ...options
        };
    }

    /**
     * Make HTTP request with error handling and retries
     */
    async _makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        let lastError;
        for (let attempt = 0; attempt <= this.options.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                if (attempt < this.options.retries && !error.name === 'AbortError') {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    continue;
                }
                break;
            }
        }

        throw lastError;
    }

    /**
     * Submit a query to a specific agent
     * @param {string} prompt - The question or task
     * @param {string} taskType - Type of task (explanation, fact_check, etc.)
     * @param {string} userId - Unique user identifier
     * @returns {Promise<Object>} Agent response with quality metrics
     */
    async ask(prompt, taskType = 'explanation', userId = 'anonymous') {
        if (!prompt) {
            throw new Error('Prompt is required');
        }

        const validTaskTypes = ['explanation', 'fact_check', 'code_generation', 'task_breakdown', 'final_synthesis'];
        if (!validTaskTypes.includes(taskType)) {
            throw new Error(`Invalid task type. Must be one of: ${validTaskTypes.join(', ')}`);
        }

        return await this._makeRequest('/api/ask', {
            body: JSON.stringify({
                prompt,
                task_type: taskType,
                user_id: userId
            })
        });
    }

    /**
     * Submit a query to the full multi-agent collaboration system
     * @param {string} prompt - The question or task
     * @param {string} userId - Unique user identifier
     * @returns {Promise<Object>} Comprehensive multi-agent analysis
     */
    async collaborate(prompt, userId = 'anonymous') {
        if (!prompt) {
            throw new Error('Prompt is required');
        }

        return await this._makeRequest('/api/collaborate', {
            body: JSON.stringify({
                prompt,
                user_id: userId
            })
        });
    }

    /**
     * Submit a healthcare-related query
     * @param {string} userId - Unique user identifier
     * @param {string} userMessage - Patient's message or concern
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Healthcare workflow response
     */
    async healthcare(userId, userMessage, options = {}) {
        if (!userId || !userMessage) {
            throw new Error('userId and userMessage are required');
        }

        const requestBody = {
            user_id: userId,
            user_message: userMessage,
            session_transcript: options.sessionTranscript || '',
            patient_info: options.patientInfo || {}
        };

        return await this._makeRequest('/api/healthcare', {
            body: JSON.stringify(requestBody)
        });
    }

    /**
     * Batch process multiple queries
     * @param {Array} queries - Array of query objects
     * @returns {Promise<Array>} Array of responses
     */
    async batch(queries) {
        if (!Array.isArray(queries) || queries.length === 0) {
            throw new Error('Queries must be a non-empty array');
        }

        const promises = queries.map(query => {
            switch (query.type) {
                case 'ask':
                    return this.ask(query.prompt, query.taskType, query.userId);
                case 'collaborate':
                    return this.collaborate(query.prompt, query.userId);
                case 'healthcare':
                    return this.healthcare(query.userId, query.userMessage, query.options);
                default:
                    return Promise.reject(new Error(`Unknown query type: ${query.type}`));
            }
        });

        return await Promise.allSettled(promises);
    }

    /**
     * Stream responses for long-running queries (if supported)
     * @param {string} prompt - The question or task
     * @param {string} userId - Unique user identifier
     * @param {Function} onUpdate - Callback for updates
     * @returns {Promise<Object>} Final response
     */
    async stream(prompt, userId, onUpdate) {
        // For now, fall back to regular collaborate
        // In the future, this could use Server-Sent Events or WebSockets
        const result = await this.collaborate(prompt, userId);
        if (onUpdate) {
            onUpdate(result);
        }
        return result;
    }
}

// React Hook for easy integration
function useMultiAgent(baseUrl, options = {}) {
    const [client] = useState(() => new MultiAgentClient(baseUrl, options));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const ask = useCallback(async (prompt, taskType, userId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.ask(prompt, taskType, userId);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client]);

    const collaborate = useCallback(async (prompt, userId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.collaborate(prompt, userId);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client]);

    const healthcare = useCallback(async (userId, userMessage, options) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.healthcare(userId, userMessage, options);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client]);

    return {
        client,
        ask,
        collaborate,
        healthcare,
        loading,
        error
    };
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = { MultiAgentClient, useMultiAgent };
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define(() => ({ MultiAgentClient, useMultiAgent }));
} else {
    // Browser global
    window.MultiAgentClient = MultiAgentClient;
    window.useMultiAgent = useMultiAgent;
}
