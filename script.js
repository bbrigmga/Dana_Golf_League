let teams = [];
let currentWeek = 1;

document.addEventListener("DOMContentLoaded", () => {
    const teamForm = document.getElementById("teamForm");
    const scoreForm = document.getElementById("scoreForm");
    const teamSelect = document.getElementById("teamSelect");

    // Load teams from localStorage if available
    if (localStorage.getItem('teams')) {
        teams = JSON.parse(localStorage.getItem('teams'));
        updateTeamSelect();
        updateLeaderboard();
    }

    // Handle team creation
    teamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const teamName = document.getElementById("teamName").value;
        const members = document.getElementById("teamMembers").value.split(',').map(m => m.trim());
        
        const newTeam = {
            name: teamName,
            members: members,
            scores: Array(10).fill(null),
            totalScore: 0
        };
        
        teams.push(newTeam);
        updateTeamSelect();
        updateLeaderboard();
        saveToLocalStorage();
        
        teamForm.reset();
    });

    // Handle score submission
    scoreForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const week = parseInt(document.getElementById("weekNumber").value);
        const teamIndex = teamSelect.selectedIndex;
        const score = parseInt(document.getElementById("teamScore").value);
        
        if (teamIndex >= 0 && teamIndex < teams.length) {
            teams[teamIndex].scores[week - 1] = score;
            teams[teamIndex].totalScore = teams[teamIndex].scores
                .filter(s => s !== null)
                .reduce((sum, s) => sum + s, 0);
            
            updateLeaderboard();
            saveToLocalStorage();
            scoreForm.reset();
        }
    });
});

function updateTeamSelect() {
    const teamSelect = document.getElementById("teamSelect");
    teamSelect.innerHTML = teams.map(team => 
        `<option value="${team.name}">${team.name}</option>`
    ).join('');
}

function updateLeaderboard() {
    const leaderboardBody = document.getElementById("leaderboardBody");
    
    // Sort teams by total score (ascending)
    const sortedTeams = [...teams].sort((a, b) => a.totalScore - b.totalScore);
    
    leaderboardBody.innerHTML = sortedTeams.map((team, index) => {
        const weekScores = team.scores.map((score, weekIndex) => 
            `<td class="week-score">${score !== null ? score : '-'}</td>`
        ).join('');
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.members.join(', ')}</td>
                <td>${team.totalScore}</td>
                ${weekScores}
            </tr>
        `;
    }).join('');
}

function saveToLocalStorage() {
    localStorage.setItem('teams', JSON.stringify(teams));
}
