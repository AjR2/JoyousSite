import streamlit as st
import requests
import json
from datetime import datetime

API_URL = "http://127.0.0.1:8001"

st.set_page_config(page_title="Multi-Agent AI Dashboard", layout="wide")
st.title("🩺 Mental Health Multi-Agent AI Demo")

# --- Agent Management ---
@st.cache_data(show_spinner=False)
def fetch_agents():
    try:
        r = requests.get(f"{API_URL}/agents")
        if r.status_code == 200:
            return r.json()
        return []
    except Exception:
        return []

def create_agent_api(agent):
    r = requests.post(f"{API_URL}/agents", json=agent)
    return r.json() if r.status_code == 200 else {"success": False, "error": r.text}

def start_conversation_api():
    r = requests.post(f"{API_URL}/conversations")
    if r.status_code == 200:
        return r.json().get("conversation_id")
    return None

# --- Initialize Session State ---
if 'intake_complete' not in st.session_state:
    st.session_state['intake_complete'] = False
    st.session_state['intake_data'] = {}
    st.session_state['selected_agent'] = None
    st.session_state['conversation_id'] = None
    st.session_state['conversation_history'] = []
    st.session_state['conversation_state'] = {}
    st.session_state['user_message'] = ""

if not st.session_state['intake_complete']:
    st.title("👋 Welcome to Our Healthcare Service")
    st.write("Please provide the following information to help us assist you better.")
    
    with st.form("intake_form"):
        # Personal Information
        st.subheader("Personal Information")
        name = st.text_input("Full Name *", key="intake_name")
        age = st.number_input("Age *", min_value=0, max_value=120, step=1, key="intake_age")
        
        # Contact Information
        st.subheader("Contact Information")
        email = st.text_input("Email Address *", key="intake_email")
        phone = st.text_input("Phone Number *", key="intake_phone")
        
        # Medical Information
        st.subheader("Medical Information")
        concerns = st.text_area("What brings you in today? *", 
                             placeholder="Please describe your symptoms or concerns in detail",
                             key="intake_concerns")
        
        # Insurance Information (optional)
        st.subheader("Insurance Information (Optional)")
        has_insurance = st.checkbox("I have insurance", key="intake_has_insurance")
        
        if has_insurance:
            insurance_provider = st.text_input("Insurance Provider", key="intake_insurance_provider")
            member_id = st.text_input("Member ID", key="intake_member_id")
            group_number = st.text_input("Group Number", key="intake_group_number")
        else:
            insurance_provider = ""
            member_id = ""
            group_number = ""
        
        # Consent
        st.subheader("Consent")
        consent = st.checkbox("I consent to the use of my information for healthcare purposes *", 
                            key="intake_consent")
        
        # Form submission
        submitted = st.form_submit_button("Continue to Chat")
        
        if submitted:
            if not all([name, age, email, phone, concerns, consent]):
                st.error("Please fill in all required fields (marked with *)")
            else:
                st.session_state['intake_data'] = {
                    'name': name,
                    'age': age,
                    'email': email,
                    'phone': phone,
                    'concerns': concerns,
                    'insurance': {
                        'has_insurance': has_insurance,
                        'provider': insurance_provider if has_insurance else None,
                        'member_id': member_id if has_insurance else None,
                        'group_number': group_number if has_insurance else None
                    }
                }
                st.session_state['intake_complete'] = True
                st.rerun()
    
    st.stop()  # Don't show the rest of the app until intake is complete

# --- Sidebar: User Inputs & Agent Management ---
st.sidebar.header("User Settings")

# User info from intake
user_id = st.sidebar.text_input("User ID", value=st.session_state['intake_data'].get('email', 'user@example.com'))
session_transcript = st.sidebar.text_area("Session Transcript", 
                                        value=f"Patient: {st.session_state['intake_data'].get('name')}\n"
                                              f"Age: {st.session_state['intake_data'].get('age')}\n"
                                              f"Concerns: {st.session_state['intake_data'].get('concerns')}",
                                        disabled=True)

# Agent selection
st.sidebar.header("Agent Management")
agents = fetch_agents()
agent_names = [f"{a['agent_id']} ({a['description']})" for a in agents]
agent_ids = [a['agent_id'] for a in agents]

if 'selected_agent' not in st.session_state and agent_ids:
    st.session_state['selected_agent'] = agent_ids[0]
if 'conversation_id' not in st.session_state:
    st.session_state['conversation_id'] = None

# Agent selection dropdown
selected = st.sidebar.selectbox("Select AI Agent", agent_names, index=agent_ids.index(st.session_state['selected_agent']) if agent_ids and st.session_state['selected_agent'] in agent_ids else 0)
if agent_ids:
    st.session_state['selected_agent'] = agent_ids[agent_names.index(selected)]

# New agent creation form
with st.sidebar.expander("➕ Create New Agent"):
    new_id = st.text_input("Agent ID", key="new_agent_id")
    new_desc = st.text_input("Description", key="new_agent_desc")
    new_inputs = st.text_input("Inputs (comma-separated)", value="user_message", key="new_agent_inputs")
    new_outputs = st.text_input("Outputs (comma-separated)", value="response", key="new_agent_outputs")
    new_escalate = st.checkbox("Escalates to human?", key="new_agent_escalate")
    if st.button("Create Agent", key="create_agent_btn"):
        if new_id and new_desc:
            payload = {
                "agent_id": new_id,
                "description": new_desc,
                "inputs": [i.strip() for i in new_inputs.split(",") if i.strip()],
                "outputs": [o.strip() for o in new_outputs.split(",") if o.strip()],
                "escalates_to_human": new_escalate
            }
            result = create_agent_api(payload)
            if result.get("success"):
                st.success(f"Agent '{new_id}' created! Reload page to see it in the list.")
            else:
                st.error(f"Failed to create agent: {result.get('error')}")
        else:
            st.warning("Agent ID and Description required.")

# --- Conversation Management ---
st.sidebar.markdown("---")
if st.sidebar.button("Start New Conversation"):
    conv_id = start_conversation_api()
    if conv_id:
        st.session_state['conversation_id'] = conv_id
        st.success(f"New conversation started: {conv_id}")
    else:
        st.error("Failed to start new conversation.")

if st.session_state['conversation_id']:
    st.sidebar.info(f"Current Conversation ID: {st.session_state['conversation_id']}")
if st.session_state['selected_agent']:
    st.sidebar.info(f"Current Agent: {st.session_state['selected_agent']}")

# --- Main Chat Interface ---
st.markdown("""
    <style>
    .stButton>button {
        width: 100%;
        margin-top: 10px;
    }
    .stTextArea>div>div>textarea {
        min-height: 100px;
    }
    </style>
""", unsafe_allow_html=True)

# Message input at bottom
st.markdown("### Chat with your healthcare assistant")
st.write(f"You're chatting as: {st.session_state['intake_data'].get('name')}")

# Display initial message if this is the first message
if len(st.session_state['conversation_history']) == 0:
    initial_message = (
        f"Hello {st.session_state['intake_data'].get('name', 'there')}! I'm your healthcare assistant. "
        "I see you're here about: " + st.session_state['intake_data'].get('concerns', 'your concerns') + 
        ". How can I assist you today?"
    )
    st.session_state['conversation_history'].append({
        'role': 'agent',
        'content': initial_message,
        'timestamp': datetime.now()
    })

user_message = st.text_area("Your message", 
                          placeholder="Type your message here...", 
                          key="user_message",
                          label_visibility="collapsed")

# --- Multi-turn Conversation State ---
if 'conversation_history' not in st.session_state:
    st.session_state['conversation_history'] = []

# --- Chat Bubble Renderer ---
def render_chat_bubble(role, content, timestamp):
    time_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
    content = str(content).replace('\n', '<br>')
    
    if role == 'agent':
        st.markdown(f'''
            <div style="background-color:#e6f0fa;border-radius:12px;padding:12px 18px;margin:8px 0;max-width:75%;float:left;clear:both;box-shadow:0 1px 4px #d3e4f1;word-wrap:break-word;">
                <b style="color:#1565c0;">🤖 AI Assistant</b> <span style="color:#888;font-size:0.8em;float:right">{time_str}</span><br>
                <div style="color:#222;margin-top:8px;white-space:pre-line;">{content}</div>
            </div>
            <div style="clear:both;"></div>
        ''', unsafe_allow_html=True)
    elif role == 'system':
        st.markdown(f'''
            <div style="background-color:#fff3e0;border-left:4px solid #ff9800;padding:10px 15px;margin:10px 0;border-radius:0 8px 8px 0;">
                <div style="color:#e65100;font-weight:500;margin-bottom:5px;">System Notification</div>
                <div style="color:#5d4037;">{content}</div>
                <div style="color:#888;font-size:0.8em;text-align:right;">{time_str}</div>
            </div>
        ''', unsafe_allow_html=True)
    else:  # user
        st.markdown(f'''
            <div style="background-color:#d1ffd6;border-radius:12px;padding:12px 18px;margin:8px 0 8px auto;max-width:75%;float:right;clear:both;box-shadow:0 1px 4px #d3e4c1;word-wrap:break-word;">
                <b style="color:#188038;">👤 You</b> <span style="color:#888;font-size:0.8em;float:left">{time_str}</span><br>
                <div style="color:#222;margin-top:8px;text-align:left;white-space:pre-line;">{content}</div>
            </div>
            <div style="clear:both;"></div>
        ''', unsafe_allow_html=True)

# Display conversation history
st.markdown("<div style='clear:both;margin-bottom:20px;'></div>", unsafe_allow_html=True)

if len(st.session_state.get('conversation_history', [])) == 0:
    st.markdown(
        '<div style="color:#888;font-style:italic;text-align:center;margin:40px 0;">' 
        'Start a conversation by typing a message below</div>', 
        unsafe_allow_html=True
    )
else:
    # Add a container to hold all chat messages with some padding at the bottom
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state['conversation_history']:
            render_chat_bubble(msg['role'], msg['content'], msg['timestamp'])
    # Add some space at the bottom of the chat
    st.markdown("<div style='clear:both;margin-bottom:40px;'></div>", unsafe_allow_html=True)

# Initialize conversation state if not exists
if 'conversation_state' not in st.session_state:
    st.session_state['conversation_state'] = {}

# Helper: continue workflow from a given stage with updated input
def continue_workflow(stage, prev_outputs, user_input):
    # Merge user input into the correct place in prev_outputs
    if stage == "intake":
        prev_outputs["user_message"] = user_input
    elif stage == "triage":
        prev_outputs["structured_intake_data"]["additional_info"] = user_input
    elif stage == "scheduler":
        prev_outputs["patient_availability"] = user_input
    return prev_outputs

# Main message submission
if st.button("Submit to AI Agents") or st.session_state.get('pending_question'):
    if not (user_id.strip() and user_message.strip() and st.session_state.get('selected_agent') and st.session_state.get('conversation_id')):
        st.warning("Please provide User ID, Message, select an Agent, and start a Conversation.")
        st.stop()
        
    with st.spinner("Processing with multi-agent system..."):
        # Prepare the complete patient information
        patient_info = {
            'name': st.session_state['intake_data'].get('name', ''),
            'age': st.session_state['intake_data'].get('age', ''),
            'concerns': st.session_state['intake_data'].get('concerns', ''),
            'insurance': {
                'provider': st.session_state['intake_data'].get('insurance_provider', ''),
                'member_id': st.session_state['intake_data'].get('member_id', '')
            },
            'contact': {
                'email': st.session_state['intake_data'].get('email', ''),
                'phone': st.session_state['intake_data'].get('phone', '')
            },
            'consent': st.session_state['intake_data'].get('consent', False)
        }
        
        # If this is a follow-up to a pending question, include the conversation state
        current_stage = st.session_state.get('conversation_state', {}).get('stage')
        last_output = st.session_state.get('conversation_state', {}).get('last_agent_output', {})
        
        # Prepare the payload with all necessary information
        payload = {
            "user_id": user_id.strip(),
            "user_message": user_message.strip(),
            "session_transcript": session_transcript.strip(),
            "patient_info": patient_info,
            "agent_id": st.session_state['selected_agent'],
            "conversation_id": st.session_state['conversation_id'],
            "current_stage": current_stage,
            "previous_outputs": last_output
        }
        
        try:
            response = requests.post(f"{API_URL}/healthcare/route", json=payload)
            if response.status_code == 200:
                data = response.json()
                
                # Process the response
                if data.get('message') or data.get('request_info'):
                    message_content = data.get('message', data.get('request_info', ''))
                    
                    # Append agent message to conversation history
                    st.session_state['conversation_history'].append({
                        'role': 'agent',
                        'content': message_content,
                        'stage': data.get('stage'),
                        'timestamp': datetime.now()
                    })
                    
                    # If there are next steps, add them as a follow-up message
                    if data.get('next_steps'):
                        next_steps = "\n".join([f"• {step}" for step in data['next_steps']])
                        st.session_state['conversation_history'].append({
                            'role': 'agent',
                            'content': f"Here are some suggested next steps:\n\n{next_steps}",
                            'stage': data.get('stage'),
                            'timestamp': datetime.now()
                        })
                    
                    # If escalation is needed, add a warning message
                    if data.get('escalation_flag', False):
                        st.session_state['conversation_history'].append({
                            'role': 'system',
                            'content': "⚠️ Your case has been escalated to a healthcare professional. Someone will contact you shortly.",
                            'timestamp': datetime.now()
                        })
                    
                    # Update conversation state
                    st.session_state['conversation_state'] = {
                        'trace': data.get('trace', []),
                        'stage': data.get('stage'),
                        'pending_question': data.get('request_info'),
                        'last_agent_output': data.get('trace', [{}])[-1].get('output', {}) if data.get('trace') else {}
                    }
                    
                    # Clear the input field and rerun
                    st.session_state['user_message'] = ""
                    st.rerun()
                
                # Handle final response if there is one
                elif 'final_response' in data and data['final_response']:
                    content = str(data['final_response'])
                    if 'Could not parse LLM response' in content and 'raw_llm_response' in data:
                        content += f"\n\nRaw LLM response: {data['raw_llm_response']}"
                        
                    st.session_state['conversation_history'].append({
                        'role': 'agent',
                        'content': content,
                        'timestamp': datetime.now()
                    })
                    
                    # Clear any pending questions
                    if 'pending_question' in st.session_state:
                        del st.session_state['pending_question']
                        
                    # Clear the input field and rerun
                    st.session_state['user_message'] = ""
                    st.rerun()
                    
                else:
                    st.error("No response content received from the server")
            else:
                st.error(f"Error {response.status_code}: {response.text}")
                
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
