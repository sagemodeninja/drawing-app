import { Point } from './point';

export class DrawingData {
    constructor(public brush: string, public color: string) {}
    
    points: DrawingDataPoint[] = [];
}

export class DrawingDataPoint {
    constructor(public size: number, public point: Point) {}
}