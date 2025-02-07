let teams = [];
let roundRobinMatches = [];
let bracketMatches = [];

function getInitialTeams() {
    // Try to get teams from Firebase
    const savedTeams = localStorage.getItem('golfTeams');
    if (savedTeams) {
        return JSON.parse(savedTeams);
    }
    
    // Default teams if none in storage
    return [
        {
            id: 1,
            team_name: "BTFD",
            team_members: "Garrett Brigman & John Mueller",
            round_1: null,
            round_2: null,
            round_3: null
        },
        {
            id: 2,
            team_name: "Master Market Jedi's",
            team_members: "Mike Honkamp & Brian Lehky",
            round_1: null,
            round_2: null,
            round_3: null
        },
        {
            id: 3,
            team_name: "Leverage Legends",
            team_members: "Steve Jaeger & Alton Wigly",
            round_1: null,
            round_2: null,
            round_3: null
        },
        {
            id: 4,
            team_name: "Cap Gains Gang",
            team_members: "Perry Pocaro & Jim Mirsberger",
            round_1: null,
            round_2: null,
            round_3: null
        }
    ];
}

async function fetchLeaderboard() {
    try {
        const data = getInitialTeams();
        console.log('Loaded teams:', data);
        return data;
    } catch (error) {
        console.error('Error loading teams:', error);
        return [];
    }
}

function updateScore(teamName, roundIndex, newScore) {
    // Find the team in the data
    const data = getInitialTeams();
    const team = data.find(t => t.team_name === teamName);
    if (team) {
        // Update the score for the specific round
        team[`round_${roundIndex + 1}`] = newScore ? parseInt(newScore) : null;
        // Save back to localStorage
        localStorage.setItem('golfTeams', JSON.stringify(data));
        // Refresh the display
        displayLeaderboard();
    }
}

async function displayLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';

    const data = await fetchLeaderboard();
    if (!data || data.length === 0) return;

    // Map the data to our team structure
    teams = data.map(row => {
        // Extract round scores from the row
        const scores = [];
        for (let i = 1; i <= 10; i++) {
            const score = row[`round_${i}`];
            scores.push(score ? parseInt(score) : null);
        }

        return {
            id: row.id,
            name: row.team_name,
            members: row.team_members,
            scores: scores,
            wins: 0
        };
    });

    // Group teams by team name
    const teamGroups = {};
    teams.forEach(team => {
        if (!teamGroups[team.name]) {
            teamGroups[team.name] = [];
        }
        teamGroups[team.name].push(team);
    });

    // Create team entries for the leaderboard
    const leaderboardTeams = Object.entries(teamGroups).map(([teamName, members]) => {
        const teamScores = members.map(m => m.scores).flat();
        const totalScore = teamScores.reduce((sum, score) => sum + (score || 0), 0);
        
        return {
            name: teamName,
            members: members.map(m => m.members).join(' & '),
            totalScore: totalScore,
            scores: members[0].scores // Using first member's scores for now
        };
    });

    // Sort teams by total score
    leaderboardTeams.sort((a, b) => b.totalScore - a.totalScore);

    // Display teams in the leaderboard
    leaderboardTeams.forEach((team, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td>${team.members}</td>
            <td>${team.totalScore}</td>
            ${team.scores.map((score, idx) => 
                `<td><input type="number" value="${score || ''}" 
                    onchange="updateScore('${team.name}', ${idx}, this.value)"
                    class="score-input"></td>`
            ).join('')}
            ${Array(10 - team.scores.length)
                .fill('<td><input type="number" class="score-input" disabled></td>')
                .join('')}
        `;
        leaderboardBody.appendChild(tr);
    });

    generateRoundRobinSchedule();
}

function generateRoundRobinSchedule() {
    roundRobinMatches = [];
    
    // Get unique teams (in case of duplicates) and filter out BYE
    const uniqueTeams = Array.from(new Set(teams.map(t => t.name)))
        .filter(name => name !== "BYE")
        .map(name => ({ name }));
    
    // If odd number of teams, add a "bye" team
    if (uniqueTeams.length % 2 !== 0) {
        uniqueTeams.push({ name: "BYE" });
    }
    
    const n = uniqueTeams.length;
    const rounds = n - 1;
    const half = n / 2;
    
    // Generate rounds using Circle Method
    for (let round = 0; round < rounds; round++) {
        const roundMatches = [];
        
        // Pair teams for this round
        for (let i = 0; i < half; i++) {
            const team1 = uniqueTeams[i];
            const team2 = uniqueTeams[n - 1 - i];
            
            // Only create match if neither team is BYE
            if (team1.name !== "BYE" && team2.name !== "BYE") {
                roundMatches.push({
                    team1: team1.name,
                    team2: team2.name,
                    score1: null,
                    score2: null,
                    round: round + 1
                });
            }
        }
        
        // Rotate teams for next round (first position is fixed)
        uniqueTeams.splice(1, 0, uniqueTeams.pop());
        
        roundRobinMatches.push(...roundMatches);
    }

    displayRoundRobinSchedule();
}

function displayRoundRobinSchedule() {
    const scheduleDiv = document.getElementById('roundRobinSchedule');
    scheduleDiv.innerHTML = '';

    let currentRound = 0;
    let roundDiv;

    roundRobinMatches.forEach((match, index) => {
        if (match.round !== currentRound) {
            currentRound = match.round;
            roundDiv = document.createElement('div');
            roundDiv.innerHTML = `<h4>Round ${currentRound}</h4>`;
            scheduleDiv.appendChild(roundDiv);
        }

        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        matchDiv.innerHTML = `
            <span>${match.team1}</span>
            <span class="vs">VS</span>
            <span>${match.team2}</span>
        `;
        roundDiv.appendChild(matchDiv);
    });
}

function generateBracket() {
    // Sort teams by wins for seeding
    const seededTeams = teams
        .filter(team => team.name !== "BYE")
        .sort((a, b) => b.wins - a.wins);

    bracketMatches = [];
    const rounds = Math.ceil(Math.log2(seededTeams.length));
    
    // Generate first round matches
    let matchCount = Math.pow(2, rounds - 1);
    let firstRound = [];
    
    for (let i = 0; i < matchCount; i++) {
        if (i < seededTeams.length / 2) {
            firstRound.push({
                team1: seededTeams[i].name,
                team2: seededTeams[seededTeams.length - 1 - i].name,
                score1: null,
                score2: null,
                round: 1,
                winner: null
            });
        }
    }
    
    bracketMatches.push(firstRound);
    document.getElementById('bracket').style.display = 'block';
    displayBracket();
}

function displayBracket() {
    const bracketDiv = document.getElementById('bracketDisplay');
    bracketDiv.innerHTML = '';

    bracketMatches.forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        
        round.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'bracket-match';
            matchDiv.innerHTML = `
                <div>${match.team1 || 'TBD'}</div>
                <div>vs</div>
                <div>${match.team2 || 'TBD'}</div>
            `;
            roundDiv.appendChild(matchDiv);
        });
        
        bracketDiv.appendChild(roundDiv);
    });
}

async function init() {
    try {
        await displayLeaderboard();
        // Show bracket button after round robin is complete
        const bracketBtn = document.createElement('button');
        bracketBtn.textContent = 'Generate Championship Bracket';
        bracketBtn.onclick = generateBracket;
        bracketBtn.style.margin = '20px 0';
        document.getElementById('roundRobin').appendChild(bracketBtn);
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => init().catch(console.error));
