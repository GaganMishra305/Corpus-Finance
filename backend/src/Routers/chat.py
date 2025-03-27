from fastapi import APIRouter

from Models.chat import ChatHistory, ChatMessage

router = APIRouter()

@router.post("/chat", response_model=ChatHistory)
async def process_chat(chat_history: ChatHistory):
    # Simulate bot response - In real implementation, you would call your AI model here
    bot_response = ChatMessage(
        role="assistant",
        content="This is a simulated response from the AI assistant."
    )
    
    # Append bot response to chat history
    chat_history.messages.append(bot_response)
    
    return chat_history