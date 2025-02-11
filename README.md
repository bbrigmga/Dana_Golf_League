# Office Golf League Leaderboard

A simple web application to manage and display the office golf league tournament schedule and leaderboard.

## Features
- Displays team rankings and scores
- Generates round robin tournament schedule
- Automatically creates championship brackets
- Reads scores directly from CSV file

## Setup as GitHub Page

1. Create a new repository on GitHub
2. Upload these files to your repository:
   - index.html
   - script.js
   - styles.css
   - scores.csv
   - logo.jpg (if you want to keep the logo)

3. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll down to "GitHub Pages" section
   - Under "Source", select "main" branch
   - Click Save

4. Your site will be available at: `https://[your-username].github.io/[repository-name]`

## Updating Scores

1. Edit scores.csv directly in GitHub:
   - Go to scores.csv in your repository
   - Click the pencil icon to edit
   - Update scores for each round
   - Commit changes
   - Wait for the GitHub Actions workflow to complete (check Actions tab)
   - Your changes will be live on the GitHub Pages site

2. Or update locally and push:
   - Edit scores.csv on your computer
   - Commit and push changes to GitHub
   ```bash
   git add scores.csv
   git commit -m "Updated scores for round X"
   git push
   ```
   - Wait for the GitHub Actions workflow to complete (check Actions tab)
   - Your changes will be live on the GitHub Pages site

Note: After pushing changes, you can monitor the deployment:
1. Go to the repository's "Actions" tab
2. Look for the latest "Deploy to GitHub Pages" workflow run
3. Once it shows a green checkmark, your changes are live
4. You may need to do a hard refresh (Ctrl+F5) in your browser to see the updates

## CSV Format
scores.csv follows this format:
```csv
team_name,team_members,round_1,round_2,round_3
BTFD,Garrett Brigman & John Mueller,,,
Master Market Jedi's,Mike Honkamp & Brian Lehky,,,
```

- Leave scores empty (,,) for rounds not yet played
- Only enter numbers for scores (no text)
- Don't add extra spaces after commas

## Local Development

To run locally:
1. Open index.html in your web browser
2. Edit scores.csv as needed
3. Refresh the page to see updates
