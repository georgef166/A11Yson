import os
import google.generativeai as genai
from models import QuizResult, CognitiveIssue
import json

# Configure Gemini (Assume API Key is in environment variables)
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

class GeminiService:
    def __init__(self):
        # self.model = genai.GenerativeModel('gemini-pro')
        pass

    async def generate_quiz(self):
        # Placeholder for generating quiz questions based on general cognitive markers
        # In a real scenario, this would ask Gemini to generate dynamic questions.
        initial_questions = [
            {"question_id": 1, "text": "Do you often find it difficult to focus on a single task for a long period?", "options": ["Yes", "Sometimes", "No"]},
            {"question_id": 2, "text": "Does reading large blocks of text feel overwhelming or cause the words to 'swim'?", "options": ["Yes", "Sometimes", "No"]},
            {"question_id": 3, "text": "Are you easily distracted by background noises or visual clutter?", "options": ["Yes", "Sometimes", "No"]},
            {"question_id": 4, "text": "Do you prefer a dark mode or specific color contrasts when reading on a screen?", "options": ["Yes, Dark Mode", "Yes, Low Contrast", "No Preference"]},
            {"question_id": 5, "text": "Do bright images or flashing animations bother you?", "options": ["Yes", "Sometimes", "No"]}
        ]
        return initial_questions

    async def analyze_results(self, responses: list) -> QuizResult:
        # Placeholder logic. 
        # Ideally, we send the responses to Gemini to interpret the likely cognitive profile.
        
        # PROMPT for Gemini would be:
        # "Analyze these survey responses and suggest potential cognitive accessibility needs..."
        
        # Mock logic for now
        suggested_issues = []
        preferences = {"theme": "default", "images": "allowed"}

        # Naive mock logic
        for r in responses:
            if r['question_id'] == 1 and r['selected_option'] == "Yes":
                suggested_issues.append(CognitiveIssue(name="ADHD", description="Potential difficulty with focus."))
            if r['question_id'] == 2 and r['selected_option'] == "Yes":
                suggested_issues.append(CognitiveIssue(name="Dyslexia", description="Reading difficulties."))
            if r['question_id'] == 5 and r['selected_option'] == "Yes":
                 preferences["images"] = "blocked"

        return QuizResult(
            suggested_issues=suggested_issues,
            suggested_preferences=preferences
        )
