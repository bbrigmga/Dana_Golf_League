# Office Golf League Leaderboard

A simple web application to manage and display the office golf league tournament schedule and leaderboard.

## Features
- Displays team rankings and scores
- Generates round robin tournament schedule
- Automatically creates championship brackets
- No server required - works entirely in the browser

## Setup as GitHub Page

1. Create a new repository on GitHub
2. Upload these files to your repository:
   - index.html
   - script.js
   - styles.css
   - Logo.jpg (if you want to keep the logo)

3. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll down to "GitHub Pages" section
   - Under "Source", select "main" branch
   - Click Save

4. Your site will be available at: `https://[your-username].github.io/[repository-name]`

## Local Development

To run locally, simply open `index.html` in your web browser. No server setup required!

## How it Works
- Team data is stored in browser's local storage
- Round robin scheduling ensures each team plays against every other team exactly once
- Scores can be updated and will persist between sessions
- Championship bracket is generated based on team performance

## Updating Teams or Scores
- Team data is initialized with default values
- Scores are saved in your browser's local storage
- Clear your browser data to reset scores
