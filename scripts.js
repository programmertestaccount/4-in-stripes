const gameStatusTypes = {
    "ballFalling": 0,
    "waitingForMovement": 1,
    "win": 2
}

const gameState = {
    status: gameStatusTypes.waitingForMovement,
    fallingInterval: null,
    playerTurn: 1,
    playerAmount: 2,
    nextPlayer: function () {
        this.playerTurn = (this.playerTurn % this.playerAmount) + 1;
        playerDashboardHandler.setPlayer(this.playerTurn)
        this.setState(gameStatusTypes.waitingForMovement);
    },
    setState: function (status) {
        this.status = status;
        this.update();
    },
    update: function () {
        if (this.status == gameStatusTypes.win) {
            alert(`The player ${gameState.playerTurn} is the winner`)
        }
    }
}

const playerDashboardHandler = {
    playerDashboard: document.getElementsByClassName("player-dashboard")[0],
    setPlayer: function (playerNumber) {
        const players = this.playerDashboard.querySelectorAll(".player");
        players.forEach(element => element.classList.remove("active"));
        players[playerNumber - 1].classList.add("active")

    }
}

const boardHandler = {
    board: document.getElementById("board"),
    getFreeRow: function (column) {
        const rows = boardHandler.board.querySelectorAll(`.cell[data-columns*='${column}']`)
        for (let index = rows.length - 1; index >= 0; index--) {
            if (!rows[index].childElementCount) {
                return rows[index];
            }
        }
        return null;
    },
    addBallInColumn: function (column) {
        const row = this.getFreeRow(column);
        if (row) {
            const ball = new Ball(row, gameState.playerTurn, true)
            return ball;
        }
        return null;
        //TODO: Que hacer cuando estamos en el limite de filas y no se puede agregar?
    },
    getColumnHeaderByIndex: function (index) {
        return boardHandler.board.querySelectorAll(`.cell-header[data-columns*='${index}']`)[0]
    }
}

const logicBoard = {
    data: {},
    lastBall: {},
    addBall: function ({ row, column, playerNumber }) {
        this.data[row] = this.data[row] || {};
        this.data[row][column] = playerNumber;
        this.lastBall = { row, column, playerNumber };
    },
    getData: function (row, column) {
        if (this.data[row] && this.data[row][column]) {
            return this.data[row][column];
        }
        return null;
    },
    isWin() {

        const checkRow = (lastBallColumn, lastBallRow, lastBallPlayerNumber) => {
            let ballSeguidas = 1;

            //Check right
            let columnToCheck = lastBallColumn + 1
            while (this.getData(lastBallRow, columnToCheck) == lastBallPlayerNumber) {
                ballSeguidas++;
                columnToCheck++;
            }

            //Check left
            columnToCheck = lastBallColumn - 1
            while (this.getData(lastBallRow, columnToCheck) == lastBallPlayerNumber) {
                ballSeguidas++;
                columnToCheck--;
            }

            return ballSeguidas >= 4;
        }

        const checkColumn = (lastBallColumn, lastBallRow, lastBallPlayerNumber) => {
            let ballSeguidas = 1;

            //Check hacia abajo
            let rowToCheck = lastBallRow + 1
            while (this.getData(rowToCheck, lastBallColumn) == lastBallPlayerNumber) {
                ballSeguidas++;
                rowToCheck++;
            }

            return ballSeguidas >= 4;
        }

        const checkDiagonalAscendente = (lastBallColumn, lastBallRow, lastBallPlayerNumber) => {
            let ballSeguidas = 1;

            //Check right
            let columnToCheck = lastBallColumn + 1
            let rowToCheck = lastBallRow - 1
            while (this.getData(rowToCheck, columnToCheck) == lastBallPlayerNumber) {
                ballSeguidas++;
                columnToCheck++;
                rowToCheck--;
            }

            //Check left
            columnToCheck = lastBallColumn - 1
            rowToCheck = lastBallRow + 1
            while (this.getData(rowToCheck, columnToCheck) == lastBallPlayerNumber) {
                ballSeguidas++;
                columnToCheck--;
                rowToCheck++;
            }

            return ballSeguidas >= 4;
        }

        const checkDiagonalDesendente = (lastBallColumn, lastBallRow, lastBallPlayerNumber) => {
            let ballSeguidas = 1;

            //Check right
            let columnToCheck = lastBallColumn + 1
            let rowToCheck = lastBallRow + 1
            while (this.getData(rowToCheck, columnToCheck) == lastBallPlayerNumber) {
                ballSeguidas++;
                columnToCheck++;
                rowToCheck++;
            }

            //Check left
            columnToCheck = lastBallColumn - 1
            rowToCheck = lastBallRow - 1
            while (this.getData(rowToCheck, columnToCheck) == lastBallPlayerNumber) {
                ballSeguidas++;
                columnToCheck--;
                rowToCheck--;
            }

            return ballSeguidas >= 4;
        }

        return checkRow(this.lastBall.column, this.lastBall.row, this.lastBall.playerNumber)
            || checkDiagonalAscendente(this.lastBall.column, this.lastBall.row, this.lastBall.playerNumber)
            || checkDiagonalDesendente(this.lastBall.column, this.lastBall.row, this.lastBall.playerNumber)
            || checkColumn(this.lastBall.column, this.lastBall.row, this.lastBall.playerNumber)

    }
}

let selectedColumnHeader = null;
let selectedBall = null;

document.body.addEventListener("click", function (event) {
    const columnIndex = event.target?.getAttribute("data-columns") || event.target.parentElement.getAttribute("data-columns");
    if (gameState.status == gameStatusTypes.waitingForMovement) {
        fallingBall(columnIndex);
    }
})

boardHandler.board.addEventListener('mousemove', (event) => {
    if (["cell", "cell-header"].some(element => event.target.classList.contains(element))) {
        if (gameState.status == gameStatusTypes.waitingForMovement) {
            const columnIndex = event.target.getAttribute("data-columns");
            setPossibleColumn(columnIndex);
        }
    }
});


function fallingBall(columnIndex) {
    gameState.setState(gameStatusTypes.ballFalling)
    const ball = boardHandler.addBallInColumn(columnIndex);
    const ballToY = ball.getBoundingClientY();
    if (!selectedBall) {
        setPossibleColumn(columnIndex)
    }
    selectedBall.falling = true;
    selectedBall.ballToY = ballToY;
    gameState.fallingInterval = setInterval(function () {
        if (!selectedBall.updateBall()) {
            ball.hidden = false;
            ball.drawInDom();
            logicBoard.addBall(ball.getRowData())
            stopFallingBall();
        }
    }, 20)
}

function stopFallingBall() {
    clearInterval(gameState.fallingInterval);
    selectedBall.clearBall();
    selectedBall = null;
    if (logicBoard.isWin()) {
        gameState.setState(gameStatusTypes.win)
        return;
    }
    gameState.nextPlayer();
}

function setPossibleColumn(columnIndex) {
    const columnHeader = boardHandler.getColumnHeaderByIndex(columnIndex)
    if (selectedColumnHeader) {
        selectedColumnHeader.innerHTML = "";
    }
    selectedColumnHeader = columnHeader
    selectedBall = new Ball(columnHeader, gameState.playerTurn);
}

function initGame() {
    for (let row = 1; row <= 6; row++) {
        for (let column = 1; column <= 7; column++) {
            addNewCell(row, column);
        }
    }

    function addNewCell(row, column) {
        const cell = createCell(row, column)
        boardHandler.board.appendChild(cell)
    }

    function createCell(row, column) {
        const cell = document.createElement('div');
        cell.className = "cell"
        cell.dataset.rows = row;
        cell.dataset.columns = column;
        return cell;
    }
}

class Ball {
    constructor(element, player, hidden) {
        this.positionY = 0;
        this.falling = false;
        this.ballToY = null;
        this.element = element;
        this.hidden = hidden;
        this.playerNumber = player;
        this.drawInDom();
        this.ballDomElement = element.children[0];
        this.column = element.getAttribute("data-columns");
        this.row = element.getAttribute("data-rows");
    }

    updateBall() {
        if (!this.falling) {
            return false;
        }
        if (selectedBall.ballDomElement.getBoundingClientRect().y >= this.ballToY) {
            this.falling = false;
            return false;
        }
        selectedBall.positionY += 10;
        selectedBall.ballDomElement.style.transform = `translate(-50%, calc(-50% + ${selectedBall.positionY}px))`
        return true;
    }

    clearBall() {
        this.ballDomElement.remove();
    }

    drawInDom() {
        if (this.hidden) {
            this.element.innerHTML = `<div class="ball hidden"> </div>`
        }
        else {
            this.element.innerHTML = `<div class="ball player-ball-${this.playerNumber}"> </div>`
        }
    }

    getBoundingClientY() {
        return this.ballDomElement.getBoundingClientRect().y;
    }

    getRowData() {
        return { row: parseInt(this.row), column: parseInt(this.column), playerNumber: parseInt(this.playerNumber) }
    }

}

initGame();