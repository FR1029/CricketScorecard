document.addEventListener('DOMContentLoaded', function(){
    if (document.getElementById('setupForm')){
        setupPage();
    }
    else if (document.getElementById('scoreDisplay')){
        livePage();
    }
    else if (document.getElementById('battingScorecard')){
        scorecardPage();
    }
    else if (document.getElementById('matchResult')){
        summaryPage();
    }
});
function setupPage(){
    const setupForm = document.getElementById('setupForm');
    setupForm.addEventListener('submit', function(setup){
        setup.preventDefault();
        const team1 = document.getElementById('team1').value;
        const team2 = document.getElementById('team2').value;
        const tossWinner = document.getElementById('tossWinner').value;
        const tossDecision = document.getElementById('tossDecision').value;
        let matchData = {
            team1: team1,
            team2: team2,
            tossWinner: tossWinner === 'team1' ? team1 : team2,
            battingTeam: tossDecision === 'bat' ? (tossWinner === 'team1' ? team1 : team2) : ((tossWinner === 'team1' ? team1 : team2) === team1 ? team2 : team1),
            bowlingTeam: tossDecision === 'bowl' ? (tossWinner === 'team1' ? team1 : team2) : ((tossWinner === 'team1' ? team1 : team2) === team1 ? team2 : team1),
            tossDecision: tossDecision,
            overs: 0,
            innings: 1,
            score: 0,
            score1: 0,
            wickets: 0,
            wickets1: 0,
            balls: 0,
            balls1: 0,
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
                overs: 0,
                runs: 0,
                wickets: 0
            },
            battingScorecard: {},
            bowlingScorecard: {}
        };
        while(!matchData.currentBatter.name){
            matchData.currentBatter.name = prompt("Enter the striker's name: ");
        }
        matchData.battingScorecard[matchData.currentBatter.name] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        matchData.battingScorecard[matchData.currentBatter.name].runs = matchData.currentBatter.runs;
        matchData.battingScorecard[matchData.currentBatter.name].balls = matchData.currentBatter.balls;
        matchData.battingScorecard[matchData.currentBatter.name].fours = matchData.currentBatter.fours;
        matchData.battingScorecard[matchData.currentBatter.name].sixes = matchData.currentBatter.sixes;
        while(!matchData.nonStrikeBatter.name){
            matchData.nonStrikeBatter.name = prompt("Enter the non-striker's name: ");
        }
        matchData.battingScorecard[matchData.nonStrikeBatter.name] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        matchData.battingScorecard[matchData.nonStrikeBatter.name].runs = matchData.currentBatter.runs;
        matchData.battingScorecard[matchData.nonStrikeBatter.name].balls = matchData.currentBatter.balls;
        matchData.battingScorecard[matchData.nonStrikeBatter.name].fours = matchData.currentBatter.fours;
        matchData.battingScorecard[matchData.nonStrikeBatter.name].sixes = matchData.currentBatter.sixes;
        while(!matchData.currentBowler.name){
            matchData.currentBowler.name = prompt("Enter the first bowler's name: ");
        }
        localStorage.setItem('matchData', JSON.stringify(matchData));
        window.location.href = 'live.html';
    });
}
function livePage() {
    let matchData = JSON.parse(localStorage.getItem('matchData'));
    updateLive(matchData);
    const runButtons = document.querySelectorAll('.runBtn');
    runButtons.forEach(button => {
        button.addEventListener('click', function() {
            let runs = parseInt(this.getAttribute('data-run'));
            recordRun(matchData, runs);
        });
    });
    document.getElementById('wicketBtn').addEventListener('click', function() {
        recordWicket(matchData);
    });
    function recordRun(matchData, runs) {
        matchData.score += runs;
        matchData.currentBatter.runs += runs;
        matchData.currentBatter.balls += 1;
        if (runs === 4) matchData.currentBatter.fours += 1;
        if (runs === 6) matchData.currentBatter.sixes += 1;
        matchData.currentBowler.runs += runs;
        matchData.balls += 1;
        const batterName = matchData.currentBatter.name;
        if (!matchData.battingScorecard[batterName]) {
            matchData.battingScorecard[batterName] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        }
        matchData.battingScorecard[batterName].runs = matchData.currentBatter.runs;
        matchData.battingScorecard[batterName].balls = matchData.currentBatter.balls;
        matchData.battingScorecard[batterName].fours = matchData.currentBatter.fours;
        matchData.battingScorecard[batterName].sixes = matchData.currentBatter.sixes;
        if (matchData.balls % 6 === 0) {
            matchData.currentBowler.overs += 1;
            matchData.overs += 1;
            let temp = matchData.currentBatter;
            matchData.currentBatter = matchData.nonStrikeBatter;
            matchData.nonStrikeBatter = temp;
            const bowlerName = matchData.currentBowler.name;
            if(!matchData.currentBowler.name){
                matchData.bowlingScorecard[bowlerName] = { overs: 0, runs: 0, wickets: 0 };
            }
            matchData.bowlingScorecard[bowlerName].overs = matchData.currentBowler.overs;
            matchData.bowlingScorecard[bowlerName].runs = matchData.currentBowler.runs;
            matchData.bowlingScorecard[bowlerName].wickets = matchData.currentBowler.wickets;
            if(matchData.overs === 1){
                const newBowler = prompt("Enter new bowler name:");
                matchData.currentBowler = { name: newBowler, overs: 0, runs: 0, wickets: 0 };
            }
            if (matchData.overs === 2){
                matchData.innings = 2;
                matchData.overs = 0;
                matchData.balls1 = matchData.balls;
                matchData.balls = 0;
                matchData.score1 = matchData.score;
                matchData.score = 0;
                matchData.wickets1 = matchData.wickets;
                matchData.wickets = 0;
                let tempTeam = matchData.battingTeam;
                matchData.battingTeam = matchData.bowlingTeam;
                matchData.bowlingTeam = tempTeam;
                matchData.currentBatter = { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 };
                while(!matchData.currentBatter.name){
                    matchData.currentBatter.name = prompt("Second Innings: Enter new striker's name:");
                }
                matchData.nonStrikeBatter = { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 };
                while(!matchData.nonStrikeBatter.name){
                    matchData.nonStrikeBatter.name = prompt("Second Innings: Enter non-striker's name:");
                }
                matchData.currentBowler = { name: '', overs: 0, runs: 0, wickets: 0 };
                while(!matchData.currentBowler.name){
                    matchData.currentBowler.name = prompt("Second Innings: Enter bowler name:");
                }
            }
        }
        if (runs % 2 === 1) {
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
        matchData.balls += 1;
        const batterName = matchData.currentBatter.name;
        if (!matchData.battingScorecard[batterName]) {
            matchData.battingScorecard[batterName] = { runs: 0, status: 'not out', balls: 0, fours: 0, sixes: 0 };
        }
        matchData.battingScorecard[batterName].status = 'out';
        matchData.battingScorecard[batterName].runs = matchData.currentBatter.runs;
        matchData.battingScorecard[batterName].balls = matchData.currentBatter.balls;
        matchData.battingScorecard[batterName].fours = matchData.currentBatter.fours;
        matchData.battingScorecard[batterName].sixes = matchData.currentBatter.sixes;
        const newBatterName = prompt("Wicket! Enter new batter name:");
        matchData.currentBatter = { name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0 };
        matchData.battingScorecard[matchData.currentBatter.name] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
        matchData.battingScorecard[matchData.currentBatter.name].runs = matchData.currentBatter.runs;
        matchData.battingScorecard[matchData.currentBatter.name].balls = matchData.currentBatter.balls;
        matchData.battingScorecard[matchData.currentBatter.name].fours = matchData.currentBatter.fours;
        matchData.battingScorecard[matchData.currentBatter.name].sixes = matchData.currentBatter.sixes;
        localStorage.setItem('matchData', JSON.stringify(matchData));
        updateLive(matchData);
    }
    
    function updateLive(matchData) {
        if(matchData.innings == 1){
            document.getElementById('overallScore').innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam}`;
        }
        else{
            document.getElementById('overallScore').innerText = `${matchData.battingTeam} ${matchData.score}/${matchData.wickets} (${matchData.overs}.${matchData.balls % 6}) vs. ${matchData.bowlingTeam} ${matchData.score1}/${matchData.wickets1}`;
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
        document.getElementById('bowlerOvers').innerText = matchData.currentBowler.overs;
        document.getElementById('bowlerRuns').innerText = matchData.currentBowler.runs;
        document.getElementById('bowlerWickets').innerText = matchData.currentBowler.wickets;
        document.getElementById('bowlerMaidens').innerText = 0;
        document.getElementById('bowlerEconomy').innerText = matchData.currentBowler.overs ? (matchData.currentBowler.runs / matchData.currentBowler.overs).toFixed(2) : 0;
    }
}
function scorecardPage() {
    const matchData = JSON.parse(localStorage.getItem('matchData'));
    const battingBody = document.querySelector('#battingScorecard tbody');
    battingBody.innerHTML = '';
    Object.entries(matchData.battingScorecard).forEach(([name, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${stats.status}<td>
            <td>${stats.runs}</td>
            <td>${stats.balls}</td>
            <td>${stats.fours}</td>
            <td>${stats.sixes}</td>
            <td>${stats.balls ? ((stats.runs / stats.balls) * 100).toFixed(2) : '0.00'}</td>
        `;
        battingBody.appendChild(row);
    });
}