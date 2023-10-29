import { Point, Size } from '@/classes';

export interface IBrush {
    id: string;
    generateDab(position: Point, size: number): Path2D;
    mark(context: CanvasRenderingContext2D, position: Point, size: number): void;
}