const choices = document.querySelectorAll(".choice");
const turnText = document.getElementById("turnText");
const info = document.getElementById("info");
const winner = document.getElementById("winner");
const moves = document.getElementById("moves");

const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");

const playAgain = document.getElementById("playAgain");
const reset = document.getElementById("reset");

let player1Choice = "";
let player2Choice = "";

let player1Score = 0;
let player2Score = 0;

let currentPlayer = 1;

// Handle button clicks
choices.forEach(button => {

    button.addEventListener("click", () => {

        const choice = button.dataset.choice;

        // ---------------- PLAYER 1 ----------------

        if(currentPlayer === 1){

            player1Choice = choice;

            // Hide Player 1's move
            turnText.innerHTML = "Pass the Device";
            info.innerHTML = "Player 2, don't look! Click Play Again to continue.";

            winner.innerHTML = "Player 1 has selected.";

            disableChoices();

        }

        // ---------------- PLAYER 2 ----------------

        else{

            player2Choice = choice;

            showResult();

        }

    });

});

// Enable buttons
function enableChoices(){

    choices.forEach(btn=>{

        btn.disabled=false;
        btn.style.opacity="1";

    });

}

// Disable buttons
function disableChoices(){

    choices.forEach(btn=>{

        btn.disabled=true;
        btn.style.opacity=".5";

    });

}

// Decide winner
function showResult(){

    moves.innerHTML =
    `
    Player 1 : ${player1Choice.toUpperCase()} <br>
    Player 2 : ${player2Choice.toUpperCase()}
    `;

    if(player1Choice===player2Choice){

        winner.innerHTML="🤝 It's a Draw!";

    }

    else if(

        (player1Choice==="rock" && player2Choice==="scissors") ||

        (player1Choice==="paper" && player2Choice==="rock") ||

        (player1Choice==="scissors" && player2Choice==="paper")

    ){

        winner.innerHTML="🎉 Player 1 Wins!";
        player1Score++;
        score1.innerHTML=player1Score;

    }

    else{

        winner.innerHTML="🏆 Player 2 Wins!";
        player2Score++;
        score2.innerHTML=player2Score;

    }

    currentPlayer=1;

}

// ---------------- PLAY AGAIN ----------------

playAgain.addEventListener("click",()=>{

    // If Player 1 already selected
    if(player1Choice!=="" && currentPlayer===1){

        currentPlayer=2;

        turnText.innerHTML="Player 2's Turn";

        info.innerHTML="Choose your move";

        winner.innerHTML="Waiting for Player 2...";

        enableChoices();

        return;

    }

    // Start new round

    player1Choice="";
    player2Choice="";

    currentPlayer=1;

    turnText.innerHTML="Player 1's Turn";

    info.innerHTML="Choose your move";

    winner.innerHTML="Waiting...";

    moves.innerHTML=`
    Player 1 : - <br>
    Player 2 : -
    `;

    enableChoices();

});

// ---------------- RESET ----------------

reset.addEventListener("click",()=>{

    player1Score=0;
    player2Score=0;

    score1.innerHTML="0";
    score2.innerHTML="0";

    player1Choice="";
    player2Choice="";

    currentPlayer=1;

    winner.innerHTML="Waiting...";

    moves.innerHTML=`
    Player 1 : - <br>
    Player 2 : -
    `;

    turnText.innerHTML="Player 1's Turn";

    info.innerHTML="Choose your move";

    enableChoices();

});

// Enable buttons when page loads
enableChoices();