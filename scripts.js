import Ball from "./ball.js";

const gameStatusTypes = {
  ballFalling: 0,
  waitingForMovement: 1,
  win: 2,
};

const playerDashboardHandler = {
  playerDashboard: document.getElementsByClassName("player-dashboard")[0],
  setPlayer(playerNumber) {
    const players = this.playerDashboard.querySelectorAll(".player");
    players.forEach((element) => element.classList.remove("active"));
    players[playerNumber - 1].classList.add("active");
  },
};

const gameState = {
  status: gameStatusTypes.waitingForMovement,
  fallingInterval: null,
  playerTurn: 1,
  playerAmount: 2,
  nextPlayer() {
    this.playerTurn = (this.playerTurn % this.playerAmount) + 1;
    playerDashboardHandler.setPlayer(this.playerTurn);
    this.setState(gameStatusTypes.waitingForMovement);
  },
  setState(status) {
    this.status = status;
    this.update();
  },
  update() {
    if (this.status === gameStatusTypes.win) {
      alert(`The player ${gameState.playerTurn} is the winner`);
    }
  },
};

const boardHandler = {
  board: document.getElementById("board"),
  getFreeRow(column) {
    const columnSelector = `.cell[data-columns*='${column}']`;
    const rows = boardHandler.board.querySelectorAll(columnSelector);
    for (let index = rows.length - 1; index >= 0; index -= 1) {
      if (!rows[index].childElementCount) {
        return rows[index];
      }
    }
    return null;
  },
  addBallInColumn(column) {
    const row = this.getFreeRow(column);
    if (row) {
      const ball = new Ball(row, gameState.playerTurn, true);
      return ball;
    }
    return null;
    // TODO: Que hacer cuando estamos en el limite de filas y no se puede agregar?
  },
  getColumnHeaderByIndex(index) {
    const columnSelector = `.cell-header[data-columns*='${index}']`;
    return boardHandler.board.querySelectorAll(columnSelector)[0];
  },
};

const logicBoard = {
  data: {},
  lastBall: {},
  addBall({ row, column, playerNumber }) {
    this.data[row] = this.data[row] || {};
    this.data[row][column] = playerNumber;
    this.lastBall = { row, column, playerNumber };
  },
  getData(row, column) {
    if (this.data[row] && this.data[row][column]) {
      return this.data[row][column];
    }
    return null;
  },
  isWin() {
    const checkRow = (lastBallRow, lastBallColumn, lastBallPlayerNumber) => {
      let ballSeguidas = 1;

      // Check right
      let columnToCheck = lastBallColumn + 1;
      while (
        this.getData(lastBallRow, columnToCheck) === lastBallPlayerNumber
      ) {
        ballSeguidas += 1;
        columnToCheck += 1;
      }

      // Check left
      columnToCheck = lastBallColumn - 1;
      while (
        this.getData(lastBallRow, columnToCheck) === lastBallPlayerNumber
      ) {
        ballSeguidas += 1;
        columnToCheck -= 1;
      }

      return ballSeguidas >= 4;
    };

    const checkColumn = (lastBallRow, lastBallColumn, lastBallPlayerNumber) => {
      let ballSeguidas = 1;

      // Check hacia abajo
      let rowToCheck = lastBallRow + 1;
      while (
        this.getData(rowToCheck, lastBallColumn) === lastBallPlayerNumber
      ) {
        ballSeguidas += 1;
        rowToCheck += 1;
      }

      return ballSeguidas >= 4;
    };

    const checkDiagonalAscendente = (
      lastBallRow,
      lastBallColumn,
      lastBallPlayerNumber
    ) => {
      let ballSeguidas = 1;

      // Check right
      let columnToCheck = lastBallColumn + 1;
      let rowToCheck = lastBallRow - 1;
      while (this.getData(rowToCheck, columnToCheck) === lastBallPlayerNumber) {
        ballSeguidas += 1;
        columnToCheck += 1;
        rowToCheck -= 1;
      }

      // Check left
      columnToCheck = lastBallColumn - 1;
      rowToCheck = lastBallRow + 1;
      while (this.getData(rowToCheck, columnToCheck) === lastBallPlayerNumber) {
        ballSeguidas += 1;
        columnToCheck -= 1;
        rowToCheck += 1;
      }

      return ballSeguidas >= 4;
    };

    const checkDiagonalDesendente = (
      lastBallRow,
      lastBallColumn,
      lastBallPlayerNumber
    ) => {
      let ballSeguidas = 1;

      // Check right
      let columnToCheck = lastBallColumn + 1;
      let rowToCheck = lastBallRow + 1;
      while (this.getData(rowToCheck, columnToCheck) === lastBallPlayerNumber) {
        ballSeguidas += 1;
        columnToCheck += 1;
        rowToCheck += 1;
      }

      // Check left
      columnToCheck = lastBallColumn - 1;
      rowToCheck = lastBallRow - 1;
      while (this.getData(rowToCheck, columnToCheck) === lastBallPlayerNumber) {
        ballSeguidas += 1;
        columnToCheck -= 1;
        rowToCheck -= 1;
      }

      return ballSeguidas >= 4;
    };

    const { row, column, playerNumber } = this.lastBall;

    return (
      checkRow(row, column, playerNumber) ||
      checkDiagonalAscendente(row, column, playerNumber) ||
      checkDiagonalDesendente(row, column, playerNumber) ||
      checkColumn(row, column, playerNumber)
    );
  },
};

let selectedColumnHeader = null;
let selectedBall = null;

document.body.addEventListener("click", (event) => {
  const columnIndex =
    event.target?.getAttribute("data-columns") ||
    event.target.parentElement.getAttribute("data-columns");
  if (gameState.status === gameStatusTypes.waitingForMovement) {
    fallingBall(columnIndex);
  }
});

boardHandler.board.addEventListener("mousemove", (event) => {
  if (
    ["cell", "cell-header"].some((element) =>
      event.target.classList.contains(element)
    )
  ) {
    if (gameState.status === gameStatusTypes.waitingForMovement) {
      const columnIndex = event.target.getAttribute("data-columns");
      setPossibleColumn(columnIndex);
    }
  }
});

function fallingBall(columnIndex) {
  gameState.setState(gameStatusTypes.ballFalling);
  const ball = boardHandler.addBallInColumn(columnIndex);
  const ballToY = ball.getBoundingClientY();
  if (!selectedBall) {
    setPossibleColumn(columnIndex);
  }
  selectedBall.falling = true;
  selectedBall.ballToY = ballToY;
  gameState.fallingInterval = setInterval(() => {
    if (!selectedBall.updateBall()) {
      ball.hidden = false;
      ball.drawInDom();
      logicBoard.addBall(ball.getRowData());
      stopFallingBall();
    }
  }, 20);
}

function stopFallingBall() {
  clearInterval(gameState.fallingInterval);
  selectedBall.clearBall();
  selectedBall = null;
  if (logicBoard.isWin()) {
    gameState.setState(gameStatusTypes.win);
    return;
  }
  gameState.nextPlayer();
}

function setPossibleColumn(columnIndex) {
  const columnHeader = boardHandler.getColumnHeaderByIndex(columnIndex);
  if (selectedColumnHeader) {
    selectedColumnHeader.innerHTML = "";
  }
  selectedColumnHeader = columnHeader;
  selectedBall = new Ball(columnHeader, gameState.playerTurn);
}

function initGame() {
  function createCell(row, column) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.rows = row;
    cell.dataset.columns = column;
    return cell;
  }

  function addNewCell(row, column) {
    const cell = createCell(row, column);
    boardHandler.board.appendChild(cell);
  }

  for (let row = 1; row <= 6; row += 1) {
    for (let column = 1; column <= 7; column += 1) {
      addNewCell(row, column);
    }
  }
}

initGame();
