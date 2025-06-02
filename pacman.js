class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 4;
        this.nextDirection = 4;
        this.frameCount = 7;
        this.currentFrame = 1;
        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    moveProcess() {
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
        }
    }

   eat() {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (
                (map[i][j] == 2 || map[i][j] == 4) &&
                this.getMapX() == j &&
                this.getMapY() == i
            ) {
                if (map[i][j] == 2) {
                    score++;
                    sounds.eat.play(); //sonido de pacman comiendo
                } else if (map[i][j] == 4) {
                    score += 10;
                    makeGhostsVulnerable(); // activa modo vulnerable
                    sounds.powerup.play(); //cuando come una cherry por decirlo asi
                }

                map[i][j] = 3; // marca como comido
            }
        }
    }
}


    moveBackwards() {
        switch (this.direction) {
            case Direction_Right: // Right
                this.x -= this.speed;
                break;
            case Direction_up: // Up
                this.y += this.speed;
                break;
            case Direction_left: // Left
                this.x += this.speed;
                break;
            case Direction_down: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case Direction_Right: // Right
                this.x += this.speed;
                break;
            case Direction_up: // Up
                this.y -= this.speed;
                break;
            case Direction_left: // Left
                this.x -= this.speed;
                break;
            case Direction_down: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

  
   checkGhostCollision(ghosts) {
    for (let ghost of ghosts) {
        if (
            ghost.getMapX() == this.getMapX() &&
            ghost.getMapY() == this.getMapY()
        ) {
            if (ghost.isVulnerable) {
                score += 100;
                ghost.x = 9 * oneBlockSize;
                ghost.y = 10 * oneBlockSize;
                ghost.isVulnerable = false;
                sounds.eatGhost.play(); //cuando se come un fantasma

                return false; // no perder vida
            } else {
                return true; // perder vida normalmente
            }
        }
    }
    return false;
}



    changeDirectionIfPossible() {
        if (this.direction == this.nextDirection) return;
        let tempDirection = this.direction;
        this.direction = this.nextDirection;
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);

        return mapY;
    }

    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}
