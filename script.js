const SHEET_ID = '1lJhwrodm4Z2Ye_1p9YplH-Dd-yh1vNB0KSsb60ohZ3Y';
const API_KEY = 'YOUR_API_KEY'; // Replace with actual API key

async function fetchLeaderboard() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

function displayLeaderboard(data) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';

    data.slice(1).forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row[0]}</td>
            <td>${row[1]}</td>
        `;
        leaderboardBody.appendChild(tr);
    });
}

async function init() {
    const data = await fetchLeaderboard();
    displayLeaderboard(data);
}

document.addEventListener('DOMContentLoaded', init);
