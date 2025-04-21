document.addEventListener('DOMContentLoaded', function(){
    if (document.getElementById('setupForm')) setupPage();
    else if (document.getElementById('scoreDisplay')) livePage();
    else if (document.getElementById('battingScorecard1')) scorecardPage();
    else if (document.getElementById('matchResult')) summaryPage();
});
function setupPage(){
    const setupForm = document.getElementById('setupForm');
    setupForm.addEventListener('submit', function(setup) {
        setup.preventDefault(); // Preventing default behaviour of form-submit 
        const team1 = document.getElementById('team1').value;
        const team2 = document.getElementById('team2').value;
        const tossWinner = document.getElementById('tossWinner').value;
        const tossDecision = document.getElementById('tossDecision').value;
        // Make object to store the match data
        let matchData = {
            team1: team1,
            team2: team2,
            // Decide who bats first based on toss winner and decision
            battingTeam: tossDecision === 'bat'
                ? (tossWinner === 'team1' ? team1 : team2)
                : (tossWinner === 'team1' ? team2 : team1),
            bowlingTeam: tossDecision === 'bowl'
                ? (tossWinner === 'team1' ? team1 : team2)
                : (tossWinner === 'team1' ? team2 : team1),
            overs: 0,
            innings: 1,
            extras: 0,
            // Current team scores and wickets
            score: 0,
            wickets: 0,
            balls: 0,
            striker: 0,
            nonstriker: 1,
            // First-innings score snapshot
            score1: 0,
            wickets1: 0,
            balls1: 0,
            extras: 0,
            // Current player's stats and name
            currentBatter: {
                name: '',
                status: 'not out',
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0
            },
            nonStrikeBatter: {
                name: '',
                status: 'not out',
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0
            },
            currentBowler: {
                name: '',
                balls: 0,
                runs: 0,
                wickets: 0
            },
            // Scorecards for both innings
            battingScorecard1: {}, 
            battingScorecard2: {},
            bowlingScorecard1: {},
            bowlingScorecard2: {}
        };
        matchData.team1 = matchData.battingTeam;
        matchData.team2 = matchData.bowlingTeam;
        // Player's name must not be empty
        while (!matchData.currentBatter.name) matchData.currentBatter.name = prompt("Enter the striker's name: ");
        while (!matchData.nonStrikeBatter.name) matchData.nonStrikeBatter.name = prompt("Enter the non-striker's name: ");
        while (!matchData.currentBowler.name) matchData.currentBowler.name = prompt("Enter the first bowler's name: ");
        // Update the scorecard
        matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        matchData.battingScorecard1[matchData.nonstriker] = { name: matchData.nonStrikeBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        matchData.bowlingScorecard1[matchData.overs] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 };
        // Store the matchData
        localStorage.setItem('matchData', JSON.stringify(matchData));
        // Start the match
        window.location.href = 'live.html';
    });
}
function livePage(){
    let matchData = JSON.parse(localStorage.getItem('matchData'));// Load the saved matchData from browser storage for live scoring
    updateLive(matchData);// Updating the live match
    const runButtons = document.querySelectorAll('.runBtn');
    // Record Runs
    runButtons.forEach(button => {
        button.addEventListener('click', function() {
            let runs = parseInt(this.getAttribute('data-run'));
            recordRun(matchData, runs);
        });
    });
    // Record wickets
    document.getElementById('wicketBtn').addEventListener('click', function() {
        recordWicket(matchData);
    });
    document.getElementById('wideBtn').addEventListener('click', function() {
        recordWide(matchData);
    });
    if (matchData.balls === 12 && matchData.innings === 2) {
        window.location.href = 'summary.html';
        return;
    }
    // Updates the match after scoring runs
    function recordRun(matchData, runs) {
        matchData.score += runs;
        matchData.balls++;
        matchData.currentBatter.runs += runs;
        matchData.currentBatter.balls++;
        if (runs === 4) matchData.currentBatter.fours++;
        if (runs === 6) matchData.currentBatter.sixes++;
        matchData.currentBowler.balls++;
        matchData.currentBowler.runs += runs;
        // Scorecard update
        matchData.innings === 1 ? 
            (matchData.bowlingScorecard1[matchData.overs] = { name: matchData.currentBowler.name, balls: matchData.currentBowler.balls, runs: matchData.currentBowler.runs, wickets: matchData.currentBowler.wickets},
            matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: matchData.currentBatter.runs, balls: matchData.currentBatter.balls, status: 'not out', fours: matchData.currentBatter.fours, sixes: matchData.currentBatter.sixes})
            : (matchData.bowlingScorecard2[matchData.overs] = { name: matchData.currentBowler.name, balls: matchData.currentBowler.balls, runs: matchData.currentBowler.runs, wickets: matchData.currentBowler.wickets},
            matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name, runs: matchData.currentBatter.runs, balls: matchData.currentBatter.balls, status: 'not out', fours: matchData.currentBatter.fours, sixes: matchData.currentBatter.sixes});
        checkOver(matchData);// If over is completed then over completion logic run
        if (runs % 2 === 1) {
            [matchData.striker, matchData.nonstriker] = [matchData.nonstriker, matchData.striker];
            [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
        }
        localStorage.setItem('matchData', JSON.stringify(matchData));// Match data is updated
        updateLive(matchData);// Live match update
    }
    // Record wickets
    function recordWicket(matchData) {
        matchData.wickets++;
        matchData.currentBatter.balls++;
        matchData.currentBowler.wickets++;
        matchData.currentBowler.balls++;
        matchData.balls++;
        // Scorecard update
        matchData.innings === 1 ? 
            (matchData.bowlingScorecard1[matchData.overs] = { name: matchData.currentBowler.name, balls: matchData.currentBowler.balls, runs: matchData.currentBowler.runs, wickets: matchData.currentBowler.wickets},
            matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: matchData.currentBatter.runs, balls: matchData.currentBatter.balls, status: 'out', fours: matchData.currentBatter.fours, sixes: matchData.currentBatter.sixes})
            : (matchData.bowlingScorecard2[matchData.overs] = { name: matchData.currentBowler.name, balls: matchData.currentBowler.balls, runs: matchData.currentBowler.runs, wickets: matchData.currentBowler.wickets},
            matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name, runs: matchData.currentBatter.runs, balls: matchData.currentBatter.balls, status: 'out', fours: matchData.currentBatter.fours, sixes: matchData.currentBatter.sixes});
        // New batter logic
        let newBatterName = '';
        while(!newBatterName) newBatterName = prompt("Wicket! Enter new batter name:")
        matchData.striker = matchData.wickets+1;
        matchData.currentBatter = { name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0 };
        matchData.innings === 1 ? 
            matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 }
            : matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        checkOver(matchData);// If over is completed then over completion logic run
        localStorage.setItem('matchData', JSON.stringify(matchData)); // Match data updated
        updateLive(matchData); // Live match update
    }
    function checkOver(matchData){
        if(matchData.balls === 12 && matchData.innings === 2) {
            window.location.href = 'summary.html';
            return;
        }
        if(matchData.balls % 6 == 0){
            matchData.overs += 1;
            // Change batters after completion of over
            [matchData.striker, matchData.nonstriker] = [matchData.nonstriker, matchData.striker];
            [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
            if (matchData.overs === 1){
                let newBowler = '';
                while(!newBowler) newBowler = prompt("Enter new bowler name:");
                matchData.currentBowler = { name: newBowler, balls: 0, runs: 0, wickets: 0 };
                matchData.innings === 1 ?
                    matchData.bowlingScorecard1[matchData.overs] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 }
                    : matchData.bowlingScorecard2[matchData.overs] = {name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0}
            }
            if (matchData.overs === 2 && matchData.innings === 1){
                matchData.innings++;
                // Store first inning data
                matchData.balls1 = matchData.balls;
                matchData.score1 = matchData.score;
                matchData.wickets1 = matchData.wickets;
                // Reset current inning data
                matchData.score = 0;
                matchData.balls = 0;
                matchData.overs = 0;
                matchData.wickets = 0;
                matchData.striker = 0;
                matchData.nonstriker = 1;
                // Change Batting and Bowling team
                [matchData.battingTeam, matchData.bowlingTeam] = [matchData.bowlingTeam, matchData.battingTeam];
                // Take new data for next inning
                matchData.currentBatter = { name: '', runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
                matchData.nonStrikeBatter = { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 };
                matchData.currentBowler = { name: '', balls: 0, runs: 0, wickets: 0 };
                while(!matchData.currentBatter.name) matchData.currentBatter.name = prompt("Second Innings: Enter new striker's name:");
                while(!matchData.nonStrikeBatter.name) matchData.nonStrikeBatter.name = prompt("Second Innings: Enter non-striker's name:");
                while(!matchData.currentBowler.name) matchData.currentBowler.name = prompt("Second Innings: Enter bowler name:");
                matchData.battingScorecard2[matchData.striker] = {name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0};
                matchData.battingScorecard2[matchData.nonstriker] = {name: matchData.nonStrikeBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0};
                matchData.bowlingScorecard2[matchData.overs] = {name: matchData.currentBowler.name, runs: 0, balls: 0, wickets: 0};
            }
        }
    }
    function recordWide(matchData){
        matchData.extras++;
        matchData.score++;
        matchData.currentBowler.runs++;
        matchData.innings === 1 ?
            matchData.bowlingScorecard1[matchData.overs].runs++ : matchData.bowlingScorecard2[matchData.overs].runs++;
        localStorage.setItem('matchData', JSON.stringify(matchData)); // Match data updated
        updateLive(matchData); // Live match update
    }
    function updateLive(matchData) {
        let CRR = matchData.balls ? ((matchData.score*6)/matchData.balls).toFixed(2) : "0.00";
        if(matchData.innings == 1){
            document.getElementById('overallScore').innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam}`;
            document.getElementById('runRate').innerText = `CRR: ${CRR}`;
            console.log(matchData.balls);
        }
        else{
            let NRR = (((matchData.score1+1-matchData.score)*6)/(12-matchData.balls)).toFixed(2);
            if(NRR <= 0 || (matchData.innings === 2 && matchData.overs === 2)){
                window.location.href = 'summary.html';
            }
            document.getElementById('overallScore').innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam} ${matchData.score1}/${matchData.wickets1}`;
            document.getElementById('runRate').innerText = `CRR: ${CRR} | NRR: ${NRR}`
        }
        document.getElementById('strikeName').innerText = matchData.currentBatter.name;
        document.getElementById('strikeRuns').innerText = matchData.currentBatter.runs;
        document.getElementById('strikeBalls').innerText = matchData.currentBatter.balls;
        document.getElementById('strikeFours').innerText = matchData.currentBatter.fours;
        document.getElementById('strikeSixes').innerText = matchData.currentBatter.sixes;
        document.getElementById('strikeSR').innerText = matchData.currentBatter.balls ? ((matchData.currentBatter.runs / matchData.currentBatter.balls) * 100).toFixed(2) : 0;
        document.getElementById('nonStrikeName').innerText = matchData.nonStrikeBatter.name;
        document.getElementById('nonStrikeRuns').innerText = matchData.nonStrikeBatter.runs;
        document.getElementById('nonStrikeBalls').innerText = matchData.nonStrikeBatter.balls;
        document.getElementById('nonStrikeFours').innerText = matchData.nonStrikeBatter.fours;
        document.getElementById('nonStrikeSixes').innerText = matchData.nonStrikeBatter.sixes;
        document.getElementById('nonStrikeSR').innerText = matchData.nonStrikeBatter.balls ? ((matchData.nonStrikeBatter.runs / matchData.nonStrikeBatter.balls) * 100).toFixed(2) : 0;
        document.getElementById('bowlerName').innerText = matchData.currentBowler.name;
        document.getElementById('bowlerOvers').innerText = matchData.currentBowler.balls ? `${Math.floor(matchData.currentBowler.balls/6)}.${matchData.currentBowler.balls%6}` : '0';
        document.getElementById('bowlerRuns').innerText = matchData.currentBowler.runs;
        document.getElementById('bowlerWickets').innerText = matchData.currentBowler.wickets;
        document.getElementById('bowlerMaidens').innerText = 0;
        document.getElementById('bowlerEconomy').innerText = matchData.currentBowler.overs ? (matchData.currentBowler.runs / matchData.currentBowler.overs).toFixed(2) : 0;
        document.getElementById('bowlerWide').innerText = matchData.extras;
    }
}
function scorecardPage() {
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    if (matchData.extras === 0) for (let e of document.getElementsByClassName("extras")) e.innerHTML = `(b 0, lb 0, nb 0, w 0)`;
    if (matchData.extras > 0) {
        for (let e of document.getElementsByClassName("extras")) e.innerHTML = `(w ${matchData.extras})`;
        for (let e of document.getElementsByClassName('extraRuns')) e.innerHTML = matchData.extras;
    }
    let CRR = matchData.balls ? ((matchData.score*6)/matchData.balls).toFixed(2) : "0.00";
    for (let e of document.getElementsByClassName('score')) e.innerHTML = matchData.innings === 1 ? `${Math.floor(matchData.balls/6)}.${matchData.balls%6} Ov (RR: ${CRR})`: `${matchData.balls1/6}`;
    const battingBody1 = document.querySelector('#battingScorecard1 tbody');
    if(matchData.innings === 2){
        document.querySelectorAll('.inning2').forEach(el => {
            el.style.display = 'table';
        });
    }
    battingBody1.innerHTML = '';
    document.getElementById("teamName1").innerText = matchData.team1;
    Object.entries(matchData.battingScorecard1).forEach(([batter, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stats.name}</td>
            <td>${stats.status}</td>
            <td>${stats.runs}</td>
            <td>${stats.balls}</td>
            <td>${stats.fours}</td>
            <td>${stats.sixes}</td>
            <td>${stats.balls ? ((stats.runs / stats.balls) * 100).toFixed(2) : '0.00'}</td>
        `;
        battingBody1.appendChild(row);
    });
    const bowlingBody1 = document.querySelector('#bowlingScorecard1 tbody');
    bowlingBody1.innerHTML = '';
    Object.entries(matchData.bowlingScorecard1).forEach(([bowler, stats]) => {
        const row = document.createElement('tr');
        let overs = 0.0;
        let economy = 0.00;
        if(stats.balls){
            overs = Math.floor(stats.balls/6);
            overs += (stats.balls%6)/10;
            economy = ((stats.runs*6)/stats.balls).toFixed(2);
        }
        row.innerHTML = `
            <td>${stats.name}</td>
            <td>${overs}</td>
            <td>${stats.balls === 6 ? (stats.runs ? 0 : 1) : 0}</td>
            <td>${stats.runs}</td>
            <td>${stats.wickets}</td>
            <td>${economy}</td>
        `;
        bowlingBody1.appendChild(row);
    });
    const battingBody2 = document.querySelector('#battingScorecard2 tbody');
    battingBody2.innerHTML = '';
    document.getElementById("teamName2").innerHTML = matchData.team2;
    Object.entries(matchData.battingScorecard2).forEach(([batter, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stats.name}</td>
            <td>${stats.status}</td>
            <td>${stats.runs}</td>
            <td>${stats.balls}</td>
            <td>${stats.fours}</td>
            <td>${stats.sixes}</td>
            <td>${stats.balls ? ((stats.runs / stats.balls) * 100).toFixed(2) : '0.00'}</td>
        `;
        battingBody2.appendChild(row);
    });
    const bowlingBody2 = document.querySelector('#bowlingScorecard2 tbody');
    bowlingBody2.innerHTML = '';
    Object.entries(matchData.bowlingScorecard2).forEach(([bowler, stats]) => {
        const row = document.createElement('tr');
        let overs = 0.0;
        let economy = 0.00;
        if(stats.balls){
            overs = Math.floor(stats.balls/6);
            overs += (stats.balls%6)/10;
            economy = ((stats.runs*6)/stats.balls).toFixed(2);
        }
        row.innerHTML = `
            <td>${stats.name}</td>
            <td>${overs}</td>
            <td>${stats.balls === 6 ? (stats.runs ? 0 : 1) : 0}</td>
            <td>${stats.runs}</td>
            <td>${stats.wickets}</td>
            <td>${economy}</td>
        `;
        bowlingBody2.appendChild(row);
    });
}
function summaryPage(){
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    if(matchData.score1 > matchData.score){
        document.getElementById('matchResult').innerText = `${matchData.team1} wins by ${matchData.score1-matchData.score} runs!`;
    }
    else if(matchData.score1 < matchData.score){
        document.getElementById('matchResult').innerText = `${matchData.team2} wins by ${10-matchData.wickets} wickets (${12-matchData.balls} balls left)`;
    }
    document.getElementById('resetMatchBtn').onclick = function() {
        window.location.href = 'setup.html';
        localStorage.clear();
        resetUI();
    };
}
function resetUI(){
    document.getElementById('overallScore').innerText = '';
    document.getElementById('runRate').innerText = '';
    document.getElementById('strikeName').innerText = '';
    document.getElementById('strikeRuns').innerText = '';
    document.getElementById('strikeBalls').innerText = '';
    document.getElementById('strikeFours').innerText = '';
    document.getElementById('strikeSixes').innerText = '';
    document.getElementById('strikeSR').innerText = '';
    document.getElementById('nonStrikeName').innerText = '';
    document.getElementById('nonStrikeRuns').innerText = '';
    document.getElementById('nonStrikeBalls').innerText = '';
    document.getElementById('nonStrikeFours').innerText = '';
    document.getElementById('nonStrikeSixes').innerText = '';
    document.getElementById('nonStrikeSR').innerText = '';
    document.getElementById('bowlerOvers').innerText = '';
    document.getElementById('bowlerRuns').innerText = '';
    document.getElementById('bowlerWickets').innerText = '';
    document.getElementById('bowlerMaidens').innerText = '';
    document.getElementById('bowlerEconomy').innerText = '';
}