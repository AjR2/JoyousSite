#!/bin/bash

# Vercel deployment script for Multi-Agent System

echo "🚀 Deploying Multi-Agent System to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Set up environment variables (you'll need to run these once)
echo "📝 Setting up environment variables..."
echo "Run these commands to set up your environment variables:"
echo ""
echo "vercel env add OPENAI_API_KEY"
echo "vercel env add ANTHROPIC_API_KEY" 
echo "vercel env add XAI_GROK_API_KEY"
echo "vercel env add DATABASE_URL"
echo ""
echo "Make sure to set them for Production, Preview, and Development environments"
echo ""

# Create a simple index.html for the root route
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Agent System API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { background: #007acc; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
        code { background: #e8e8e8; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🤖 Multi-Agent System API</h1>
    <p>Welcome to the Multi-Agent Reasoning System API. This system provides AI-powered analysis through multiple specialized agents.</p>
    
    <h2>Available Endpoints</h2>
    
    <div class="endpoint">
        <h3><span class="method">POST</span> /api/ask</h3>
        <p>Submit a query to a specific agent type</p>
        <p><strong>Body:</strong> <code>{"prompt": "string", "task_type": "string", "user_id": "string"}</code></p>
        <p><strong>Task Types:</strong> explanation, fact_check, code_generation, task_breakdown, final_synthesis</p>
    </div>
    
    <div class="endpoint">
        <h3><span class="method">POST</span> /api/collaborate</h3>
        <p>Submit a query to the full multi-agent collaboration system</p>
        <p><strong>Body:</strong> <code>{"prompt": "string", "user_id": "string"}</code></p>
    </div>
    
    <div class="endpoint">
        <h3><span class="method">POST</span> /api/healthcare</h3>
        <p>Healthcare-specific workflow with specialized agents</p>
        <p><strong>Body:</strong> <code>{"user_id": "string", "user_message": "string", "patient_info": {}}</code></p>
    </div>
    
    <h2>Example Usage</h2>
    <pre><code>
// JavaScript example
const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: "Explain quantum computing",
        task_type: "explanation", 
        user_id: "user123"
    })
});
const result = await response.json();
console.log(result);
    </code></pre>
    
    <h2>Features</h2>
    <ul>
        <li>✅ Multi-agent collaboration with GPT-4, Claude, and Grok</li>
        <li>✅ Advanced quality control and confidence scoring</li>
        <li>✅ Contradiction detection and resolution</li>
        <li>✅ Healthcare-specific workflows</li>
        <li>✅ Memory and context management</li>
        <li>✅ Performance analytics</li>
    </ul>
    
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
        <p>Multi-Agent Reasoning System - Powered by Vercel Serverless Functions</p>
    </footer>
</body>
</html>
EOF

# Copy requirements for serverless
cp requirements-serverless.txt requirements.txt

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables using the commands above"
echo "2. Test your endpoints at your Vercel domain"
echo "3. Update your frontend to use the new API endpoints"
echo ""
echo "🔗 Your API will be available at: https://your-project.vercel.app/api/"
