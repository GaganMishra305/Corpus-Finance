from pydantic import BaseModel
from typing import List, Literal

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatHistory(BaseModel):
    messages: List[ChatMessage]