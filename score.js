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
            battingTeam: tossDecision === 'bat'
                ? (tossWinner === 'team1' ? team1 : team2)
                : (tossWinner === 'team1' ? team2 : team1),
            bowlingTeam: tossDecision === 'bowl'
                ? (tossWinner === 'team1' ? team1 : team2)
                : (tossWinner === 'team1' ? team2 : team1),
            innings: 1,
            score: 0,
            balls: 0,
            wickets: 0,
            overs: 0,// It also helps in indexing bowler
            striker: 0,// It is for indexing striker
            nonstriker: 1,// It is for indexing non-striker
            wides: 0,
            noBalls: 0,
            isFreehit: false,
            isNoBall: false,
            isRunout: false,
            // First-innings score snapshot
            score1: 0,
            balls1: 0,
            wickets1: 0,
            wides1: 0,
            noBalls1: 0,
            currentBatter: { name: '', status: 'not out', runs: 0, balls: 0, fours: 0, sixes: 0 },
            nonStrikeBatter: { name: '', status: 'not out', runs: 0, balls: 0, fours: 0, sixes: 0 },
            currentBowler: { name: '', balls: 0, runs: 0, wickets: 0, noBalls: 0, wides: 0 },
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
        localStorage.setItem('matchData', JSON.stringify(matchData));// Store the matchData in local storage
        window.location.href = 'live.html';// Start the match
    });
}
function livePage(){
    let matchData = JSON.parse(localStorage.getItem('matchData'));// Load the saved matchData from local storage
    if(!matchData) window.location.href = "setup.html";
    updateLive(matchData);// Live match update
    document.querySelectorAll('.runBtn').forEach(button => {
        button.addEventListener('click', function() {
            let runs = parseInt(this.getAttribute('runs'));
            recordRun(matchData, runs);
        });
    });
    document.getElementById('wicketBtn').addEventListener('click', function() {
        (matchData.isFreehit || matchData.isNoBall) ? recordRun(matchData,0) : recordWicket(matchData);
    });
    document.getElementById('wideBtn').addEventListener('click', function() {
        matchData.wides++;
        matchData.score++;
        matchData.currentBowler.runs++;
        matchData.currentBowler.wides++;
        matchData.innings === 1 ?
            matchData.bowlingScorecard1[matchData.overs].runs++ : matchData.bowlingScorecard2[matchData.overs].runs++;
        updateLive(matchData);
    });
    document.getElementById('noBallBtn').addEventListener('click', function() {
        matchData.isFreehit = true;
        matchData.isNoBall = true;
        matchData.currentBowler.runs++;
        matchData.currentBowler.noBalls++;
        matchData.score++;
        matchData.noBalls++;
        updateLive(matchData);
    });
    document.getElementById('runoutBtn').addEventListener('click', function() {
        matchData.isRunout = true;
        updateLive(matchData);
    });
    document.getElementById('scorecardBtn').addEventListener('click', function() {
        updateLive(matchData);
        window.location.href = 'scorecard.html';
    });
    if (matchData.balls === 12 && matchData.innings === 2) {
        updateLive(matchData);
        window.location.href = 'summary.html';
    }
    function recordRun(matchData, runs) {
        matchData.score += runs;
        matchData.currentBatter.runs += runs;
        matchData.currentBowler.runs += runs;
        matchData.currentBatter.balls++;
        if(!matchData.isRunout){
            if (runs === 4) matchData.currentBatter.fours++;
            if (runs === 6) matchData.currentBatter.sixes++;
        }
        if(runs % 2 === 1) {
            [matchData.striker, matchData.nonstriker] = [matchData.nonstriker, matchData.striker];
            [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
        }
        if(matchData.isRunout){
            updateScorecard(matchData)
            matchData.currentBatter.status = 'out';
            matchData.wickets++;
            matchData.innings === 1 ?
                matchData.battingScorecard1[matchData.striker].status = 'out'
                : matchData.battingScorecard2[matchData.striker].status = 'out';
            let newBatterName = '';
            while(!newBatterName) newBatterName = prompt("Wicket! Enter new batter name:")
            matchData.striker = matchData.wickets+1;
            matchData.currentBatter = { name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0 };
            matchData.innings === 1 ? 
                matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 }
                : matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        }
        document.getElementById('noBallBtn').style.display = 'block';
        if(!matchData.isNoBall) {
            matchData.balls++;
            matchData.currentBowler.balls++;
            checkOver(matchData);
            matchData.isFreehit = false;
            document.getElementById('extraDisplay').style.display = 'none';
        }
        matchData.isNoBall = false;
        matchData.isRunout = false;
        updateLive(matchData);
    }
    function recordWicket(matchData) {
        matchData.wickets++;
        matchData.currentBatter.balls++;
        matchData.currentBowler.balls++;
        matchData.balls++;
        matchData.currentBowler.wickets++;
        // Scorecard update
        matchData.innings === 1 ? 
            (matchData.bowlingScorecard1[matchData.overs].balls++,matchData.bowlingScorecard1[matchData.overs].wickets++,
            matchData.battingScorecard1[matchData.striker].balls++, matchData.battingScorecard1[matchData.striker].status = 'out')
            : (matchData.bowlingScorecard2[matchData.overs].balls++,matchData.bowlingScorecard2[matchData.overs].wickets++,
            matchData.battingScorecard2[matchData.striker].balls++, matchData.battingScorecard2[matchData.striker].status = 'out');
        // New batter logic
        if(matchData.wickets === 10 ) {
            matchData.innings === 1 ? changeInnings(matchData) : window.location.href = 'summary.html';
        }
        else{
            let newBatterName = '';
            while(!newBatterName) newBatterName = prompt("Wicket! Enter new batter name:")
            matchData.striker = matchData.wickets+1;
            matchData.currentBatter = { name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0 };
            matchData.innings === 1 ? 
                matchData.battingScorecard1[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 }
                : matchData.battingScorecard2[matchData.striker] = { name: matchData.currentBatter.name, runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
            checkOver(matchData);// If over is completed then over completion logic run
        }
        updateLive(matchData);// Live match update
    }
    function changeInnings(matchData){
        matchData.innings++;
        // Store first inning data
        matchData.balls1 = matchData.balls;
        matchData.score1 = matchData.score;
        matchData.wickets1 = matchData.wickets;
        matchData.wides1 = matchData.wides;
        matchData.noBalls1 = matchData.noBalls;
        // Reset current inning data
        matchData.score = 0;
        matchData.balls = 0;
        matchData.overs = 0;
        matchData.wickets = 0;
        matchData.striker = 0;
        matchData.nonstriker = 1;
        matchData.wides = 0;
        matchData.noBalls = 0;
        // Change Batting and Bowling team
        [matchData.battingTeam, matchData.bowlingTeam] = [matchData.bowlingTeam, matchData.battingTeam];
        // Take new data for next inning
        matchData.currentBatter = { name: '', runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        matchData.nonStrikeBatter = { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 };
        matchData.currentBowler = { name: '', balls: 0, runs: 0, wickets: 0, noBalls: 0, wides: 0 };
        while(!matchData.currentBatter.name) matchData.currentBatter.name = prompt("Second Innings: Enter new striker's name:");
        while(!matchData.nonStrikeBatter.name) matchData.nonStrikeBatter.name = prompt("Second Innings: Enter non-striker's name:");
        while(!matchData.currentBowler.name) matchData.currentBowler.name = prompt("Second Innings: Enter bowler name:");
    }
    function checkOver(matchData){
        if(matchData.balls === 12 && matchData.innings === 2) {
            window.location.href = 'summary.html';
            return;
        }
        if(matchData.balls % 6 == 0){
            updateScorecard(matchData);
            matchData.overs += 1;
            // Change batters after completion of over
            [matchData.striker, matchData.nonstriker] = [matchData.nonstriker, matchData.striker];
            [matchData.currentBatter, matchData.nonStrikeBatter] = [matchData.nonStrikeBatter, matchData.currentBatter];
            if (matchData.overs === 1){
                let newBowler = '';
                while(!newBowler) newBowler = prompt("Enter new bowler name:");
                matchData.currentBowler = { name: newBowler, balls: 0, runs: 0, wickets: 0, noBalls: 0, wides: 0 };
            }
            if (matchData.overs === 2 && matchData.innings === 1) changeInnings(matchData);
        }
    }
    function updateScorecard(matchData){
        matchData.innings === 1 ? 
                (matchData.bowlingScorecard1[matchData.overs] = { 
                    name: matchData.currentBowler.name, 
                    balls: matchData.currentBowler.balls, 
                    runs: matchData.currentBowler.runs, 
                    wickets: matchData.currentBowler.wickets, 
                    noBalls: matchData.currentBowler.noBalls, 
                    wides: matchData.currentBowler.wides },
                matchData.battingScorecard1[matchData.striker] = { 
                    name: matchData.currentBatter.name, 
                    runs: matchData.currentBatter.runs, 
                    balls: matchData.currentBatter.balls, 
                    status: 'not out', 
                    fours: matchData.currentBatter.fours, 
                    sixes: matchData.currentBatter.sixes },
                matchData.battingScorecard1[matchData.nonstriker] = {
                    name: matchData.nonStrikeBatter.name, 
                    runs: matchData.nonStrikeBatter.runs, 
                    balls: matchData.nonStrikeBatter.balls, 
                    status: 'not out', 
                    fours: matchData.nonStrikeBatter.fours, 
                    sixes: matchData.nonStrikeBatter.sixes })
                : (matchData.bowlingScorecard2[matchData.overs] = { 
                    name: matchData.currentBowler.name, 
                    balls: matchData.currentBowler.balls, 
                    runs: matchData.currentBowler.runs, 
                    wickets: matchData.currentBowler.wickets, 
                    noBalls: matchData.currentBowler.noBalls, 
                    wides: matchData.currentBowler.wides },
                matchData.battingScorecard2[matchData.striker] = { 
                    name: matchData.currentBatter.name, 
                    runs: matchData.currentBatter.runs, 
                    balls: matchData.currentBatter.balls, 
                    status: 'not out', 
                    fours: matchData.currentBatter.fours, 
                    sixes: matchData.currentBatter.sixes },
                matchData.battingScorecard2[matchData.nonstriker] = {
                    name: matchData.nonStrikeBatter.name, 
                    runs: matchData.nonStrikeBatter.runs, 
                    balls: matchData.nonStrikeBatter.balls, 
                    status: 'not out', 
                    fours: matchData.nonStrikeBatter.fours, 
                    sixes: matchData.nonStrikeBatter.sixes});
    }
    function updateLive(matchData) {
        if(matchData.isNoBall){
            document.getElementById('extraDisplay').style.display = 'block';
            document.getElementById('extraDisplay').innerText = "It's a no ball";
            document.getElementById('noBallBtn').style.display = 'none';
            document.getElementById('wideBtn').style.display = 'none';
        }
        else if (matchData.isFreehit){
            document.getElementById('extraDisplay').style.display = 'block';
            document.getElementById('extraDisplay').innerText = "It's a free hit";
            document.getElementById('wideBtn').style.display = 'block';
        }
        if (matchData.isRunout){
            document.getElementById('extraDisplay').style.display = 'block';
            document.getElementById('extraDisplay').innerText = "It's a runout";
            const extraBtns = document.getElementsByClassName("extraBtn");
            for (let i = 0; i < extraBtns.length; i++) {
                extraBtns[i].style.display = 'none';
            }
        }
        updateScorecard(matchData);// Scorecard is updated
        let CRR =  "0.00";
        if(matchData.balls === 0 && matchData.score > 0){
            CRR = "-";
        }
        else if (matchData.balls > 0){
            CRR = ((matchData.score*6)/matchData.balls).toFixed(2);
        }
        if(matchData.innings == 1){
            document.getElementById('overallScore').innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam}`;
            document.getElementById('runRate').innerText = `CRR: ${CRR}`;
        }
        else{
            let NRR = (((matchData.score1+1-matchData.score)*6)/(12-matchData.balls)).toFixed(2);
            if(NRR <= 0 || (matchData.innings === 2 && (matchData.overs === 2 || matchData.wickets === 10))){
                window.location.href = 'summary.html';
            }
            document.getElementById('overallScore').innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam} ${matchData.score1}/${matchData.wickets1}`;
            document.getElementById('runRate').innerText = `CRR: ${CRR} | NRR: ${NRR}`
        }
        let economy = "0.00"
        if(matchData.currentBowler.balls) economy = ((matchData.currentBowler.runs*6) / matchData.currentBowler.balls).toFixed(2);
        else if (matchData.currentBowler.balls === 0 && matchData.currentBowler.runs > 0) economy = "-";
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
        document.getElementById('bowlerEconomy').innerText = economy;
        document.getElementById('bowlerWide').innerText = matchData.currentBowler.wides;
        document.getElementById('bowlerNoBall').innerHTML = matchData.currentBowler.noBalls;
        localStorage.setItem('matchData', JSON.stringify(matchData));// Store the matchData in local storage
    }
}
function scorecardPage() {
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    if(!matchData) window.location.href = "setup.html";
    let CRR =  "0.00";
    if(matchData.balls === 0){
        if(matchData.score > 0 ) CRR = "-";
    }
    else if (matchData.balls > 0) {
        CRR = ((matchData.score*6)/matchData.balls).toFixed(2);
    }
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
        if(stats.balls === 0 && stats.runs > 0) economy = '-';
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
            <td>${stats.wides}</td>
            <td>${stats.noBalls}</td>
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
        if(stats.balls === 0 && stats.runs > 0) economy = '-';
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
            <td>${stats.wides}</td>
            <td>${stats.noBalls}</td>
        `;
        bowlingBody2.appendChild(row);
    });
    matchData.innings === 1 ? 
        (document.getElementById('overs1').innerHTML = `${Math.floor(matchData.balls/6)}.${matchData.balls%6} Ov (RR: ${CRR})`,
        document.getElementById('score1').innerHTML = `${matchData.score}/${matchData.wickets}`,
        document.getElementById('extras1').innerHTML = `(nb: ${matchData.noBalls}, w: ${matchData.wides})`,
        document.getElementById('extraRuns1').innerText = matchData.noBalls+matchData.wides )
        : (document.getElementById('overs1').innerHTML = `${Math.floor(matchData.balls1/6)}.${matchData.balls1%6} Ov (RR: ${((matchData.score1*6)/matchData.balls1).toFixed(2)})`,
        document.getElementById('overs2').innerHTML = `${Math.floor(matchData.balls/6)}.${matchData.balls%6} Ov (RR: ${CRR})`,
        document.getElementById('score1').innerHTML = `${matchData.score1}/${matchData.wickets1}`,
        document.getElementById('score2').innerHTML = `${matchData.score}/${matchData.wickets}`,
        document.getElementById('extras1').innerHTML = `(nb: ${matchData.noBalls1}, w: ${matchData.wides1})`,
        document.getElementById('extras2').innerHTML = `(nb: ${matchData.noBalls}, w: ${matchData.wides})`,
        document.getElementById('extraRuns1').innerText = matchData.noBalls1+matchData.wides1,
        document.getElementById('extraRuns2').innerText = matchData.noBalls+matchData.wides );
}
function summaryPage(){
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    if(!matchData) window.location.href = "setup.html";
    if(matchData.score1 > matchData.score) document.getElementById('matchResult').innerText = `${matchData.team1} wins by ${matchData.score1-matchData.score} runs!`;
    else if(matchData.score1 < matchData.score) document.getElementById('matchResult').innerText = `${matchData.team2} wins by ${10-matchData.wickets} wickets (${12-matchData.balls} balls left)`;
    else document.getElementById('matchResult').innerText = "It's a tie";
    document.getElementById('resetMatchBtn').onclick = function() {
        window.location.href = 'setup.html';
        localStorage.clear();
    };
}