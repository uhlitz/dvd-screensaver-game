export default class Player {
    constructor(name, element, x, y, velocityX, velocityY, color, colorIndex) {
        this.name = name;
        this.element = element;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.colorIndex = colorIndex;
        this.corners = 0;
        this.bounces = 0;
    }

    updatePosition() {
        if (this.element) {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }

    randomizeBounceAngle() {
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        const angle = (35 + Math.random() * 20) * (Math.PI / 180);
        const signX = Math.sign(this.velocityX) || 1;
        const signY = Math.sign(this.velocityY) || 1;
        this.velocityX = Math.cos(angle) * speed * signX;
        this.velocityY = Math.sin(angle) * speed * signY;
    }

    changeColor(colors) {
        let newIndex = this.colorIndex;
        const total = colors.length;
        if (total > 1) {
            while (newIndex === this.colorIndex) {
                newIndex = Math.floor(Math.random() * total);
            }
        }
        this.colorIndex = newIndex;
        this.color = colors[newIndex];
        const svgPaths = this.element.querySelectorAll('path');
        svgPaths.forEach(p => p.style.fill = this.color);
        this.element.style.filter = `drop-shadow(0 0 20px ${this.color}80)`;
    }

    addBounceEffect() {
        this.element.classList.add('bounce-effect');
        setTimeout(() => this.element?.classList.remove('bounce-effect'), 50);
    }

    checkCollision(config, container, colors, playBounceSound, handleWin) {
        const { clientWidth, clientHeight } = container;
        const prevX = this.x - this.velocityX;
        const prevY = this.y - this.velocityY;
        let hitWall = false;
        let hitH = false;
        let hitV = false;

        if (this.x < 0 && prevX >= 0) {
            this.x = 0;
            this.velocityX = Math.abs(this.velocityX);
            hitWall = true;
            hitH = true;
        } else if (this.x + config.logoWidth > clientWidth && prevX + config.logoWidth <= clientWidth) {
            this.x = clientWidth - config.logoWidth;
            this.velocityX = -Math.abs(this.velocityX);
            hitWall = true;
            hitH = true;
        }
        if (this.y < 0 && prevY >= 0) {
            this.y = 0;
            this.velocityY = Math.abs(this.velocityY);
            hitWall = true;
            hitV = true;
        } else if (this.y + config.logoHeight > clientHeight && prevY + config.logoHeight <= clientHeight) {
            this.y = clientHeight - config.logoHeight;
            this.velocityY = -Math.abs(this.velocityY);
            hitWall = true;
            hitV = true;
        }
        if (hitWall) {
            this.randomizeBounceAngle();
            this.bounces++;
            this.changeColor(colors);
            this.addBounceEffect();
            playBounceSound();
            if (hitH && hitV) {
                this.corners++;
                handleWin(this);
                return { hitWall, hitCorner: true };
            }
        }
        return { hitWall, hitCorner: false };
    }
}
