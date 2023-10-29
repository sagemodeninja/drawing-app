export class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

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
        return { x, y, width, height } as Rectangle;
    }
}