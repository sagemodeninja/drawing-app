export class Rectangle {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {}

    get top() {
        return this.y;
    }

    get right() {
        return this.x + this.width;
    }

    get bottom() {
        return this.y + this.height;
    }

    get left() {
        return this.x;
    }

    static fromDOMRect({ x, y, width, height }: DOMRect) {
        return  new Rectangle(x, y, width, height);
    }
}