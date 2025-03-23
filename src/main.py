import json
from jira_client import JiraClient
from github_client import GitHubClient
from ai_service import AIService
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class TaskProcessor:
    def __init__(self):
        self.jira = JiraClient()
        self.github = GitHubClient()
        self.ai = AIService()

    def process_ai_tasks(self):
        """Main workflow to process AI tasks"""
        try:
            # 1. Get AI tasks from Jira
            tasks = self.jira.get_ai_tasks()
            if not tasks:
                logging.info("No AI tasks found in Jira")
                return

            for task in tasks:
                try:
                    logging.info(f"Processing task: {task['key']} - {task['summary']}")

                    # Check if the task is a README update task
                    if "readme" in task['summary'].lower() or "documentation" in task['summary'].lower():
                        logging.info(f"Generating README content for {task['key']}")
                        readme_content = self.ai.generate_readme_content(task)
                        self.github.update_readme(readme_content)
                        self.jira.update_task_status(task['key'], 'In Progress')  # Update Jira status
                        continue # Skip the regular code change workflow

                    # 2. Analyze task with AI (for standard code changes)
                    analysis = self.ai.analyze_task(task)
                    # ... (rest of the code for code changes remains the same)

                except Exception as e:
                    logging.error(f"Error processing task {task['key']}: {str(e)}")
                    continue

        except Exception as e:
            logging.error(f"Error in main workflow: {str(e)}")

def main():
    processor = TaskProcessor()
    processor.process_ai_tasks()

if __name__ == "__main__":
    main()
