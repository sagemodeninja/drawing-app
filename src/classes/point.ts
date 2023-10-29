import { Rectangle } from "./rectangle";

export class Point {
    constructor(public x: number, public y: number) {}

    distanceTo(point: Point): number {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    toCartesian({width, height}: Rectangle): Point {
        const centerX = width / 2;
        const centerY = height / 2;

        const cartesianX = this.x - centerX;
        const cartesianY = centerY - this.y;

        return new Point(cartesianX, cartesianY);
    }
    
    toScreen({width, height}: Rectangle): Point {
        const centerX = width / 2;
        const centerY = height / 2;

        const screenX = this.x + centerX;
        const screenY = centerY - this.y;
        
        return new Point(screenX, screenY);
    }
}