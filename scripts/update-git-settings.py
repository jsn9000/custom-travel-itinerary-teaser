#!/usr/bin/env python3
"""
Update Git repository settings across multiple projects.
Supports GitHub, GitLab, and Bitbucket.

Requirements:
    pip install requests PyGithub python-gitlab

Environment Variables:
    GITHUB_TOKEN - GitHub personal access token
    GITLAB_TOKEN - GitLab personal access token
    BITBUCKET_USER - Bitbucket username
    BITBUCKET_APP_PASSWORD - Bitbucket app password
"""

import os
import sys
import json
import requests
from typing import List, Dict, Any

# Configuration
CONFIG = {
    "platform": "github",  # github, gitlab, or bitbucket
    "organization": "your-org-name",

    # Branch protection rules
    "protected_branches": ["main", "master", "production"],
    "branch_protection": {
        "required_reviews": 1,
        "require_code_owner_reviews": False,
        "dismiss_stale_reviews": True,
        "require_status_checks": True,
        "strict_status_checks": True,
        "enforce_admins": False,
        "allow_force_pushes": False,
        "allow_deletions": False,
    },

    # Team access configuration
    # Format: {"team-name": "permission-level"}
    # GitHub permissions: pull, push, admin, maintain, triage
    # GitLab permissions: guest, reporter, developer, maintainer, owner
    "team_access": {
        "developers": "push",
        "maintainers": "admin",
        "readers": "pull",
    },

    # Repository settings
    "repo_settings": {
        "has_issues": True,
        "has_projects": True,
        "has_wiki": False,
        "allow_squash_merge": True,
        "allow_merge_commit": True,
        "allow_rebase_merge": False,
        "delete_branch_on_merge": True,
    },

    # Repositories to update (empty list = all repos in org)
    "repositories": [],  # Leave empty to automatically loop through ALL repos

    # Repository filters (optional)
    "exclude_repos": [],  # Repos to skip, e.g., ["archived-repo", "test-repo"]
    "include_pattern": None,  # Only include repos matching pattern, e.g., "^frontend-"
    "exclude_archived": True,  # Skip archived repositories
    "exclude_forks": False,  # Skip forked repositories
}


class GitHubManager:
    """Manage GitHub repository settings."""

    def __init__(self, token: str, org: str):
        self.token = token
        self.org = org
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        }
        self.base_url = "https://api.github.com"

    def get_repositories(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all repositories in the organization with metadata."""
        repos = []
        page = 1

        print(f"Fetching repositories from organization: {self.org}")

        while True:
            url = f"{self.base_url}/orgs/{self.org}/repos"
            params = {"page": page, "per_page": 100, "type": "all"}
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            data = response.json()
            if not data:
                break

            for repo in data:
                repos.append({
                    "name": repo["name"],
                    "archived": repo.get("archived", False),
                    "fork": repo.get("fork", False),
                    "private": repo.get("private", False),
                    "default_branch": repo.get("default_branch", "main"),
                })

            print(f"  Fetched page {page} ({len(repos)} repos so far)...")
            page += 1

        print(f"  Total repositories found: {len(repos)}")
        return repos

    def update_branch_protection(self, repo: str, branch: str, config: Dict[str, Any]):
        """Update branch protection rules."""
        url = f"{self.base_url}/repos/{self.org}/{repo}/branches/{branch}/protection"

        payload = {
            "required_status_checks": {
                "strict": config["strict_status_checks"],
                "contexts": [],
            } if config["require_status_checks"] else None,
            "enforce_admins": config["enforce_admins"],
            "required_pull_request_reviews": {
                "dismissal_restrictions": {},
                "dismiss_stale_reviews": config["dismiss_stale_reviews"],
                "require_code_owner_reviews": config["require_code_owner_reviews"],
                "required_approving_review_count": config["required_reviews"],
            },
            "restrictions": None,
            "allow_force_pushes": config["allow_force_pushes"],
            "allow_deletions": config["allow_deletions"],
        }

        response = requests.put(url, headers=self.headers, json=payload)
        if response.status_code == 200:
            print(f"  ✓ Protected branch '{branch}' in {repo}")
        else:
            print(f"  ✗ Failed to protect branch '{branch}' in {repo}: {response.text}")

    def update_team_access(self, repo: str, team: str, permission: str):
        """Update team access to repository."""
        url = f"{self.base_url}/orgs/{self.org}/teams/{team}/repos/{self.org}/{repo}"

        payload = {"permission": permission}
        response = requests.put(url, headers=self.headers, json=payload)

        if response.status_code in [200, 204]:
            print(f"  ✓ Set {team} access to '{permission}' for {repo}")
        else:
            print(f"  ✗ Failed to set {team} access for {repo}: {response.text}")

    def update_repo_settings(self, repo: str, settings: Dict[str, Any]):
        """Update general repository settings."""
        url = f"{self.base_url}/repos/{self.org}/{repo}"

        response = requests.patch(url, headers=self.headers, json=settings)
        if response.status_code == 200:
            print(f"  ✓ Updated settings for {repo}")
        else:
            print(f"  ✗ Failed to update settings for {repo}: {response.text}")


class GitLabManager:
    """Manage GitLab repository settings."""

    def __init__(self, token: str, org: str):
        self.token = token
        self.org = org
        self.headers = {"PRIVATE-TOKEN": token}
        self.base_url = "https://gitlab.com/api/v4"

    def get_repositories(self) -> List[str]:
        """Get all repositories in the group."""
        url = f"{self.base_url}/groups/{self.org}/projects"
        params = {"per_page": 100}
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()

        return [project["path"] for project in response.json()]

    def update_branch_protection(self, repo: str, branch: str, config: Dict[str, Any]):
        """Update branch protection rules."""
        # Get project ID
        url = f"{self.base_url}/projects/{self.org}%2F{repo}"
        response = requests.get(url, headers=self.headers)
        project_id = response.json()["id"]

        # Protect branch
        url = f"{self.base_url}/projects/{project_id}/protected_branches"
        payload = {
            "name": branch,
            "push_access_level": 0 if not config["allow_force_pushes"] else 30,
            "merge_access_level": 30,
            "allow_force_push": config["allow_force_pushes"],
        }

        response = requests.post(url, headers=self.headers, json=payload)
        if response.status_code in [200, 201]:
            print(f"  ✓ Protected branch '{branch}' in {repo}")
        else:
            print(f"  ✗ Failed to protect branch '{branch}' in {repo}")


class BitbucketManager:
    """Manage Bitbucket repository settings."""

    def __init__(self, username: str, password: str, workspace: str):
        self.auth = (username, password)
        self.workspace = workspace
        self.base_url = "https://api.bitbucket.org/2.0"

    def get_repositories(self) -> List[str]:
        """Get all repositories in the workspace."""
        url = f"{self.base_url}/repositories/{self.workspace}"
        response = requests.get(url, auth=self.auth)
        response.raise_for_status()

        return [repo["slug"] for repo in response.json()["values"]]

    def update_branch_protection(self, repo: str, branch: str, config: Dict[str, Any]):
        """Update branch protection rules."""
        url = f"{self.base_url}/repositories/{self.workspace}/{repo}/branch-restrictions"

        payload = {
            "kind": "require_approvals_to_merge",
            "branch_match_kind": "glob",
            "pattern": branch,
            "value": config["required_reviews"],
        }

        response = requests.post(url, auth=self.auth, json=payload)
        if response.status_code in [200, 201]:
            print(f"  ✓ Protected branch '{branch}' in {repo}")
        else:
            print(f"  ✗ Failed to protect branch '{branch}' in {repo}")


def main():
    """Main function to update Git settings across repositories."""

    # Determine platform and get credentials
    platform = CONFIG["platform"].lower()

    if platform == "github":
        token = os.getenv("GITHUB_TOKEN")
        if not token:
            print("Error: GITHUB_TOKEN environment variable not set")
            sys.exit(1)
        manager = GitHubManager(token, CONFIG["organization"])

    elif platform == "gitlab":
        token = os.getenv("GITLAB_TOKEN")
        if not token:
            print("Error: GITLAB_TOKEN environment variable not set")
            sys.exit(1)
        manager = GitLabManager(token, CONFIG["organization"])

    elif platform == "bitbucket":
        username = os.getenv("BITBUCKET_USER")
        password = os.getenv("BITBUCKET_APP_PASSWORD")
        if not username or not password:
            print("Error: BITBUCKET_USER and BITBUCKET_APP_PASSWORD required")
            sys.exit(1)
        manager = BitbucketManager(username, password, CONFIG["organization"])

    else:
        print(f"Error: Unsupported platform '{platform}'")
        sys.exit(1)

    # Get repositories to update
    if CONFIG["repositories"]:
        repos = CONFIG["repositories"]
    else:
        print(f"Fetching all repositories from {CONFIG['organization']}...")
        repos = manager.get_repositories()

    print(f"\nFound {len(repos)} repositories to update\n")

    # Update each repository
    for repo in repos:
        print(f"📦 Updating {repo}...")

        # Update branch protection
        if CONFIG["protected_branches"] and hasattr(manager, 'update_branch_protection'):
            for branch in CONFIG["protected_branches"]:
                try:
                    manager.update_branch_protection(
                        repo, branch, CONFIG["branch_protection"]
                    )
                except Exception as e:
                    print(f"  ✗ Error protecting branch '{branch}': {e}")

        # Update team access (GitHub only for now)
        if platform == "github" and CONFIG["team_access"]:
            for team, permission in CONFIG["team_access"].items():
                try:
                    manager.update_team_access(repo, team, permission)
                except Exception as e:
                    print(f"  ✗ Error setting team access: {e}")

        # Update repository settings (GitHub only for now)
        if platform == "github" and CONFIG["repo_settings"]:
            try:
                manager.update_repo_settings(repo, CONFIG["repo_settings"])
            except Exception as e:
                print(f"  ✗ Error updating repo settings: {e}")

        print()

    print("✅ Completed updating all repositories!")


if __name__ == "__main__":
    main()
