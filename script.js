let teams = [];
let roundRobinMatches = [];
let bracketMatches = [];

function fetchLeaderboard() {
    // Hardcode the current scores.csv content
    const csvContent = `"team_name","team_members","round_1","round_2","round_3"
"BTFD","Garrett Brigman & John Mueller","0","0","0"
"Master Market Jedi's","Mike Honkamp & Brian Lehky","0","0","0"
"Leverage Legends","Steve Jaeger & Alton Wigly","0","0","0"
"Cap Gains Gang","Perry Pocaro & Jim Mirsberger","0","0","0"`;

    const rows = csvContent.split('\n');
    const headers = rows[0].split(',').map(h => h.replace(/"/g, ''));
    
    // Parse CSV into team data
    const data = rows.slice(1).filter(row => row.trim()).map(row => {
        // Split by comma but handle quoted values
        const values = row.split(',').map(v => v.replace(/"/g, ''));
        const team = {
            team_name: values[0],
            team_members: values[1]
        };
        // Add round scores
        for (let i = 2; i < values.length; i++) {
            team[`round_${i-1}`] = values[i] ? parseInt(values[i]) : null;
        }
        return team;
    });
    
    console.log('Loaded teams:', data);
    return data;
}

function displayLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';

    const data = fetchLeaderboard();
    if (!data || data.length === 0) return;

    // Map the data to our team structure
    teams = data.map(row => {
        // Extract round scores from the row
        const scores = [];
        for (let i = 1; i <= 5; i++) {
            const score = row[`round_${i}`];
            scores.push(score ? parseInt(score) : null);
        }

        return {
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
            ${Array(5 - team.scores.length).fill('<td>-</td>').join('')}
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
    // Limit to 3 rounds for round robin phase
    const rounds = Math.min(3, n - 1);
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

function init() {
    try {
        displayLeaderboard();
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

document.addEventListener('DOMContentLoaded', init);
