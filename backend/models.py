from pydantic import BaseModel
from typing import List, Optional, Dict

class CognitiveIssue(BaseModel):
    name: str 
    severity: Optional[int] = 1 
    description: Optional[str] = None

class UserProfile(BaseModel):
    user_id: str
    username: str
    cognitive_issues: List[CognitiveIssue] = []
    preferences: Dict[str, str] = {} 

class QuizQuestion(BaseModel):
    question_id: int
    text: str
    options: List[str]

class QuizResponse(BaseModel):
    question_id: int
    selected_option: str 

class QuizResult(BaseModel):
    suggested_issues: List[CognitiveIssue]
    suggested_preferences: Dict[str, str]

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "default"
