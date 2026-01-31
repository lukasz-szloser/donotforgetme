#!/bin/bash

# Script to prepare commit and PR for project initialization

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
fi

# Create a new branch for this feature
BRANCH_NAME="feat/initialize-project-structure"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "⚠️  Branch $BRANCH_NAME already exists. Switching to it..."
    git checkout $BRANCH_NAME
else
    echo "🌿 Creating new branch: $BRANCH_NAME"
    git checkout -b $BRANCH_NAME
fi

# Stage all changes
echo "📦 Staging changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit."
    exit 0
fi

# Commit with the message
echo "💾 Creating commit..."
git commit -F COMMIT_MESSAGE.txt

echo ""
echo "✅ Commit created successfully!"
echo ""
echo "📤 To push and create PR, run:"
echo "   git push -u origin $BRANCH_NAME"
echo ""
echo "Then create a PR using the description from PR_DESCRIPTION.md"
