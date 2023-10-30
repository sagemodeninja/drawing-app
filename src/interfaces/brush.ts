import { HSL, Point } from '@/classes';

export interface IBrush {
    id: string;
    size: number;
    color: HSL;

    createDab(position: Point, size: number): Path2D;
    createDab(position: Point, size: number, path: Path2D): Path2D;
    mark(context: CanvasRenderingContext2D, position: Point): void;
}