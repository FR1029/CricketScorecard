document.addEventListener('DOMContentLoaded', function(){
    if (document.getElementById('setupForm')){
        setupPage();
    }
    else if (document.getElementById('scoreDisplay')){
        livePage();
    }
    else if (document.getElementById('battingScorecard1')){
        scorecardPage();
    }
    else if (document.getElementById('matchResult')){
        summaryPage();
    }
});
function setupPage(){
    const setupForm = document.getElementById('setupForm');
    setupForm.addEventListener('submit', function(setup){
        setup.preventDefault(); // Preventing default behaviour of form-submit 
        const team1 = document.getElementById('team1').value;
        const team2 = document.getElementById('team2').value;
        const tossWinner = document.getElementById('tossWinner').value;
        const tossDecision = document.getElementById('tossDecision').value;
        // Build the initial match state object
        let matchData = {
            // Teams
            team1: team1,
            team2: team2,
            // Decide who bats first based on toss winner and decision
            battingTeam: 
                tossDecision === 'bat'
                    ? (tossWinner === 'team1' ? team1 : team2)
                    : (tossWinner === 'team1' ? team2 : team1),
            bowlingTeam: 
                tossDecision === 'bowl'
                    ? (tossWinner === 'team1' ? team1 : team2)
                    : (tossWinner === 'team1' ? team2 : team1),
            // Innings & overs tracking
            overs: 0,
            innings: 1,
            // Current team scores and wickets
            score: 0,
            wickets: 0,
            balls: 0,
            batters: 0,
            striker: 0,
            nonstriker: 1,
            bowlers: 0,
            // First-innings score snapshot
            score1: 0,
            wickets1: 0,
            balls1: 0,
            batters1: 1,
            bowlers: 1,
            // Current batter object
            currentBatter: {
                name: '',
                status: 'not out',
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0
            },
            // Current non-strike batter object
            nonStrikeBatter: {
                name: '',
                status: 'not out',
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0
            },
            // Current bowler object
            currentBowler: {
                name: '',
                balls: 0,
                runs: 0,
                wickets: 0
            },
            // Full scorecards for both innings
            battingScorecard1: {}, 
            battingScorecard2: {},
            bowlingScorecard1: {},
            bowlingScorecard2: {}
        };
        matchData.team1 = matchData.battingTeam;
        matchData.team2 = matchData.bowlingTeam;
        // Striker's name must not be empty
        while(!matchData.currentBatter.name){
            matchData.currentBatter.name = prompt("Enter the striker's name: ");
        }
        // Initialize striker’s entry in the first-innings scorecard
        matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        // Non-striker's name must not be empty
        while(!matchData.nonStrikeBatter.name){
            matchData.nonStrikeBatter.name = prompt("Enter the non-striker's name: ");
        }
        // Initialize non-striker’s entry in the first-innings scorecard
        matchData.battingScorecard1[matchData.nonstriker] = { name: matchData.nonStrikeBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        // Bowler's name must not be empty
        while(!matchData.currentBowler.name){
            matchData.currentBowler.name = prompt("Enter the first bowler's name: ");
        }
        // Initialize bowler’s entry in the first-innings bowling scorecard
        matchData.bowlingScorecard1[matchData.bowlers] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 };
        // Store the matchData
        localStorage.setItem('matchData', JSON.stringify(matchData));
        // Now go to live page
        window.location.href = 'live.html';
    });
}
function livePage() {
    // Load the saved matchData from browser storage for live scoring
    let matchData = JSON.parse(localStorage.getItem('matchData'));
    // Updating the live match
    updateLive(matchData);
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
    // Updates the match after scoring runs
    function recordRun(matchData, runs) {
        matchData.currentBowler.balls++;
        matchData.currentBowler.runs += runs;
        // Current inning's stats update
        matchData.score += runs;
        matchData.balls += 1;
        matchData.batters = Math.max(matchData.striker, matchData.nonstriker);
        // Current batter's stats update
        matchData.currentBatter.runs += runs;
        matchData.currentBatter.balls += 1;
        if (runs === 4) matchData.currentBatter.fours += 1;
        if (runs === 6) matchData.currentBatter.sixes += 1;
        // Bowling scorecard update
        if(matchData.innings == 1){
            matchData.bowlingScorecard1[matchData.bowlers] = { name: matchData.currentBowler.name,
                                                     balls: matchData.currentBowler.balls,
                                                     runs: matchData.currentBowler.runs,
                                                     wickets: matchData.currentBowler.wickets }
            /*const batterName = matchData.currentBatter.name;
            if (!matchData.battingScorecard1[batterName]) {
                matchData.battingScorecard1[batterName] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
            }*/
            matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name,
                                                     runs: matchData.currentBatter.runs, 
                                                     balls: matchData.currentBatter.balls,
                                                     status: 'not out',
                                                     fours: matchData.currentBatter.fours,
                                                     sixes: matchData.currentBatter.sixes }
            if(matchData.balls % 6 == 0){
                matchData.bowlers++;
                matchData.overs += 1;
                let tmp = matchData.striker;
                matchData.striker = matchData.nonstriker;
                matchData.nonstriker = tmp;
                let temp = matchData.currentBatter;
                matchData.currentBatter = matchData.nonStrikeBatter;
                matchData.nonStrikeBatter = temp;
                if(matchData.overs === 1){
                    let newBowler = '';
                    do{
                        newBowler = prompt("Enter new bowler name:");
                    }while(!newBowler);
                    matchData.currentBowler = { name: newBowler, balls: 0, runs: 0, wickets: 0 };
                    matchData.bowlingScorecard1[matchData.bowlers] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 };
                }
                else if(matchData.overs === 2){
                    matchData.innings++;
                    matchData.overs = 0;
                    matchData.balls1 = matchData.balls;
                    matchData.balls = 0;
                    matchData.score1 = matchData.score;
                    matchData.score = 0;
                    matchData.wickets1 = matchData.wickets;
                    matchData.wickets = 0;
                    matchData.batters1 = matchData.batters;
                    matchData.batters = 0;
                    matchData.striker = 0;
                    matchData.nonstriker = 1;
                    let tempTeam = matchData.battingTeam;
                    matchData.battingTeam = matchData.bowlingTeam;
                    matchData.bowlingTeam = tempTeam;
                    matchData.currentBatter = { name: '', runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
                    while(!matchData.currentBatter.name){
                        matchData.currentBatter.name = prompt("Second Innings: Enter new striker's name:");
                    }
                    matchData.battingScorecard2[matchData.striker] = {name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0}
                    matchData.nonStrikeBatter = { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 };
                    while(!matchData.nonStrikeBatter.name){
                        matchData.nonStrikeBatter.name = prompt("Second Innings: Enter non-striker's name:");
                    }
                    matchData.battingScorecard2[matchData.nonstriker] = {name: matchData.nonStrikeBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0}
                    matchData.currentBowler = { name: '', balls: 0, runs: 0, wickets: 0 };
                    while(!matchData.currentBowler.name){
                        matchData.currentBowler.name = prompt("Second Innings: Enter bowler name:");
                    }
                    matchData.bowlingScorecard2[matchData.bowlers] = {name: matchData.currentBowler.name, runs: 0, balls: 0, wickets: 0}
                }
            }
        }
        else if(matchData.innings == 2){
            matchData.bowlingScorecard2[matchData.bowlers] = { name: matchData.currentBowler.name,
                                                     balls: matchData.currentBowler.balls,
                                                     runs: matchData.currentBatter.runs,
                                                     wickets: matchData.currentBowler.wickets }
            /*if (!matchData.battingScorecard2[matchData.currentBatter.name]) {
                matchData.battingScorecard2[matchData.currentBatter.name] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
            }*/
            matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name,
                                                     runs: matchData.currentBatter.runs, 
                                                     balls: matchData.currentBatter.balls,
                                                     status: 'not out',
                                                     fours: matchData.currentBatter.fours,
                                                     sixes: matchData.currentBatter.sixes }
            if(matchData.balls % 6 == 0){
                matchData.bowlers++;
                matchData.overs += 1;
                let tmp = matchData.striker;
                matchData.striker = matchData.nonstriker;
                matchData.nonstriker = tmp;
                let temp = matchData.currentBatter;
                matchData.currentBatter = matchData.nonStrikeBatter;
                matchData.nonStrikeBatter = temp;
                if(matchData.overs === 1){
                    let newBowler = '';
                    do{
                        newBowler = prompt("Enter new bowler name:");
                    }while(!newBowler);
                    matchData.currentBowler = { name: newBowler, balls: 0, runs: 0, wickets: 0 };
                    matchData.bowlingScorecard2[matchData.bowlers] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 };
                }
                else if(matchData.overs === 2){
                    window.location.href = 'summary.html';
                }
            }
        }
        if (runs % 2 === 1) {
            let tmp = matchData.striker;
            matchData.striker = matchData.nonstriker;
            matchData.nonstriker = tmp;
            let temp = matchData.currentBatter;
            matchData.currentBatter = matchData.nonStrikeBatter;
            matchData.nonStrikeBatter = temp;
        }
        localStorage.setItem('matchData', JSON.stringify(matchData));
        updateLive(matchData);
    }
    function recordWicket(matchData) {
        matchData.wickets += 1;
        matchData.currentBatter.balls += 1;
        matchData.currentBowler.wickets += 1;
        matchData.currentBowler.balls++;
        matchData.balls += 1;
        const batterName = matchData.currentBatter.name;
        /*if (!matchData.battingScorecard1[batterName]) {
            matchData.battingScorecard1[batterName] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        }*/
        if(matchData.innings === 1){
            matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name,
                                                               runs: matchData.currentBatter.runs, 
                                                               balls: matchData.currentBatter.balls,
                                                               status: 'out',
                                                               fours: matchData.currentBatter.fours,
                                                               sixes: matchData.currentBatter.sixes }
            matchData.bowlingScorecard1[matchData.bowlers] = { name: matchData.currentBowler.name,
                                                                balls: matchData.currentBowler.balls,
                                                                runs: matchData.currentBatter.runs,
                                                                wickets: matchData.currentBowler.wickets }
        }
        else{
            matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name,
                                                               runs: matchData.currentBatter.runs, 
                                                               balls: matchData.currentBatter.balls,
                                                               status: 'out',
                                                               fours: matchData.currentBatter.fours,
                                                               sixes: matchData.currentBatter.sixes }
            matchData.bowlingScorecard2[matchData.bowlers] = { name: matchData.currentBowler.name,
                                                                balls: matchData.currentBowler.balls,
                                                                runs: matchData.currentBatter.runs,
                                                                wickets: matchData.currentBowler.wickets }
        }
        if(matchData.balls % 6 == 0){
            matchData.bowlers++;
            matchData.overs += 1;
            let tmp = matchData.striker;
            matchData.striker = matchData.nonstriker;
            matchData.nonstriker = tmp;
            let temp = matchData.currentBatter;
            matchData.currentBatter = matchData.nonStrikeBatter;
            matchData.nonStrikeBatter = temp;
            if(matchData.overs === 1){
                let newBowler = '';
                do{
                    newBowler = prompt("Enter new bowler name:");
                }while(!newBowler);
                matchData.currentBowler = { name: newBowler, balls: 0, runs: 0, wickets: 0 };
                if(matchData.innings === 1){
                    matchData.bowlingScorecard1[matchData.bowlers] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 };
                }
                else{
                    matchData.bowlingScorecard2[matchData.bowlers] = { name: matchData.currentBowler.name, balls: 0, runs: 0, wickets: 0 };
                }
            }
            else if(matchData.overs === 2){
                window.location.href = 'summary.html';
            }
        }
        let newBatterName = '';
        do{
            newBatterName = prompt("Wicket! Enter new batter name:")
        }while(!newBatterName)
        matchData.batters = Math.max(matchData.striker, matchData.nonstriker);
        matchData.batters++;
        matchData.striker = matchData.batters;
        matchData.currentBatter = { name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0 };
        if(matchData.innings === 1){
            matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        }
        else{
            matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        }
        localStorage.setItem('matchData', JSON.stringify(matchData));
        updateLive(matchData);
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
            if(NRR <= 0){
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
    }
}
function scorecardPage() {
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    const battingBody1 = document.querySelector('#battingScorecard1 tbody');
    if(matchData.innings === 2){
        document.querySelectorAll('.inning2').forEach(el => {
            el.style.visibility = 'visible';
        });
    }
    battingBody1.innerHTML = '';
    document.getElementById("teamName1").innerText = matchData.team1;
    Object.entries(matchData.battingScorecard1).forEach(([batter, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stats.name}</td>
            <td>${stats.status}<td>
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
            <td>${overs}
            <td>${stats.balls === 6 ? (stats.runs ? 0 : 1) : 0}</td>
            <td>${stats.runs}</td>
            <td>${stats.wickets}</td
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
            <td>${stats.status}<td>
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
            <td>${overs}
            <td>${stats.balls === 6 ? (stats.runs ? 0 : 1) : 0}</td>
            <td>${stats.runs}</td>
            <td>${stats.wickets}</td
            <td>${economy}</td>
        `;
        bowlingBody2.appendChild(row);
    });
}
function summaryPage(){
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    if(matchData.score1 > matchData.score){
        document.getElementById('matchResult').innerText = `${matchData.team1} wins by ${matchData.score-matchData.score1} runs!`;
    }
    else if(matchData.score1 < matchData.score){
        document.getElementById('matchResult').innerText = `${matchData.team2} wins by ${10-matchData.wickets} wickets (${12-matchData.balls} balls left)`;
    }
}