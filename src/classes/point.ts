import { Rectangle } from "./rectangle";

export class Point {
    constructor(public x: number, public y: number) {}

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