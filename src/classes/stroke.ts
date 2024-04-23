import { Point } from './point';

export class IndexedPoint {
    public x: number[] = [];
    public y: number[] = [];

    public push(point: Point) {
        this.x.push(point.x);
        this.y.push(point.y);
    }
}

export class Stroke {
    constructor(brush: string, color: string) {
        this.brush = brush;
        this.color = color;
        this.points = [];
        this.indexedPoints = new IndexedPoint();
    }

    public brush: string;
    public color: string;
    public points: StrokePoint[];
    public indexedPoints: IndexedPoint;

    public addPoints(size: number, point: Point) {
        const strokePoint = new StrokePoint(size, point);

        this.indexedPoints.push(point);
        this.points.push(strokePoint);
    }
}

export class StrokePoint {
    constructor(public size: number, public point: Point) {}
}