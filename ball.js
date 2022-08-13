class Ball {
    constructor(rowDomElement, player, hidden) {
        this.positionY = 0;
        this.falling = false;
        this.ballToY = null;
        this.rowDomElement = rowDomElement;
        this.hidden = hidden;
        this.playerNumber = player;
        this.drawInDom();
        this.ballDomElement = rowDomElement.children[0];
        this.column = rowDomElement.getAttribute("data-columns");
        this.row = rowDomElement.getAttribute("data-rows");
    }

    updateBall() {
        if (!this.falling) {
            return false;
        }
        if (this.ballDomElement.getBoundingClientRect().y >= this.ballToY) {
            this.falling = false;
            return false;
        }
        this.positionY += 10;
        this.ballDomElement.style.transform = `translate(-50%, calc(-50% + ${this.positionY}px))`;
        return true;
    }

    clearBall() {
        this.ballDomElement.remove();
    }

    drawInDom() {
        const ballDomElement = document.createElement("div");
        ballDomElement.classList.add("ball");

        const ballClass = this.hidden ? "hidden" : `player-ball-${this.playerNumber}`;
        ballDomElement.classList.add(ballClass);

        this.rowDomElement.appendChild(ballDomElement);
    }

    getBoundingClientY() {
        return this.ballDomElement.getBoundingClientRect().y;
    }

    getRowData() {
        return {
            row: parseInt(this.row, 10),
            column: parseInt(this.column, 10),
            playerNumber: parseInt(this.playerNumber, 10),
        };
    }
}

export default Ball;
