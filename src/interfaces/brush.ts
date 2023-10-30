import { Point, Size } from '@/classes';

export interface IBrush {
    id: string;
    createDab(position: Point, size: number): Path2D;
    createDab(position: Point, size: number, path: Path2D): Path2D;
    mark(context: CanvasRenderingContext2D, position: Point, size: number): void;
}