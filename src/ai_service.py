import os
import openai
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        openai.api_key = os.getenv("GEMINI_API_KEY")

    def analyze_task(self, task):
        # ... (existing code)

    def generate_code_changes(self, task, analysis):
        # ... (existing code)

    def generate_readme_content(self, task):
        """Generates README content based on the task description."""
        try:
            prompt = f"""Generate a concise README.md for a poker tournament application based on this task: {task}"""
            response = openai.Completion.create(
                engine="text-davinci-003",  # Or a suitable Gemini model
                prompt=prompt,
                max_tokens=500,
                n=1,
                stop=None,
                temperature=0.7,
            )

            readme_content = response.choices[0].text.strip()
            return readme_content
        except Exception as e:
            print(f"Error generating README content: {e}")
            return None