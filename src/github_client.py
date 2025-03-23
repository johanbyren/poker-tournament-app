from github import Github
import os
from dotenv import load_dotenv

load_dotenv()

class GitHubClient:
    def __init__(self):
        self.github = Github(os.getenv("GITHUB_TOKEN"))
        self.repo = self.github.get_repo(os.getenv("GITHUB_REPO"))

    # ... (other methods)

    def update_readme(self, content):
        """Updates the README.md file in the repository."""
        try:
            contents = self.repo.get_contents("README.md", ref="main") # Get README from main branch
            self.repo.update_file(
                contents.path,
                "Update README.md",
                content,
                contents.sha,
                branch="main"  # Update directly on main for this example
            )
            print("README.md updated successfully.")
        except Exception as e:
            print(f"Error updating README.md: {e}")
