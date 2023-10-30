import { IBrush } from '@/interfaces';
import { Point } from '../point';

export class DefaultBrush implements IBrush {
    id: string = 'default-brush';

    createDab(position: Point, size: number, path?: Path2D): Path2D {
        const dab = new Path2D();
        const { x, y } = position;

        dab.arc(x, y, size / 2, 0, Math.PI * 2);

        if (path) {
            path.addPath(dab);
            return;
        }
        
        return dab;
    }

    mark(context: CanvasRenderingContext2D, position: Point, size: number): void {
        const dab = this.createDab(position, size);

        context.fillStyle = '#000';
        context.fill(dab);
    }
}