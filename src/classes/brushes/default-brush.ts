import { IBrush } from '@/interfaces';
import { Point } from '../point';

export class DefaultBrush implements IBrush {
    id: string;

    generateDab(position: Point, size: number): Path2D {
        const dab = new Path2D();
        const { x, y } = position;

        dab.arc(x, y, size / 2, 0, Math.PI * 2);
        return dab;
    }

    mark(context: CanvasRenderingContext2D, position: Point, size: number): void {
        const dab = this.generateDab(position, size);

        context.fillStyle = '#000';
        context.fill(dab);
    }
}