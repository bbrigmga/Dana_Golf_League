let teams = [];
let roundRobinMatches = [];
let bracketMatches = [];

async function fetchLeaderboard() {
    try {
        const response = await fetch('http://localhost:3000/api/teams');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

async function displayLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';

    const data = await fetchLeaderboard();
    if (!data || data.length === 0) return;

    // Map the SQLite data to our team structure
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
            ${team.scores.map(score => `<td>${score || '-'}</td>`).join('')}
            ${Array(10 - team.scores.length).fill('<td>-</td>').join('')}
        `;
        leaderboardBody.appendChild(tr);
    });

    generateRoundRobinSchedule();
}

function generateRoundRobinSchedule() {
    roundRobinMatches = [];
    const n = teams.length;
    
    // If odd number of teams, add a "bye" team
    if (n % 2 !== 0) {
        teams.push({ name: "BYE", members: "", scores: [], wins: 0 });
    }
    
    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    const halfSize = numTeams / 2;
    
    // Generate array of team indices
    let teamIndices = Array.from({length: numTeams}, (_, i) => i);
    
    // For each round
    for (let round = 0; round < numRounds; round++) {
        let roundMatches = [];
        
        // First team stays fixed, others rotate
        const firstTeam = teamIndices[0];
        
        // Generate pairings for this round
        for (let i = 0; i < halfSize; i++) {
            const team1Idx = teamIndices[i];
            const team2Idx = teamIndices[numTeams - 1 - i];
            
            // Don't create matches with BYE team
            if (teams[team1Idx].name !== "BYE" && teams[team2Idx].name !== "BYE" && team1Idx !== team2Idx) {
                roundMatches.push({
                    team1: teams[team1Idx].name,
                    team2: teams[team2Idx].name,
                    score1: null,
                    score2: null,
                    round: round + 1
                });
            }
        }
        
        // Rotate teams for next round (except first team)
        teamIndices = [
            teamIndices[0],
            ...teamIndices.slice(2),
            teamIndices[1]
        ];
        
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
