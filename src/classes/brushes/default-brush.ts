import { Point } from '../point';
import { BaseBrush } from './base-brush';

export class DefaultBrush extends BaseBrush {
    public id: string = 'default-brush';

    public override createDab(position: Point, size: number, path?: Path2D): Path2D {
        const dab = new Path2D();
        const { x, y } = position;

        dab.arc(x, y, size / 2, 0, Math.PI * 2);

        if (path) {
            path.addPath(dab);
            return;
        }
        
        return dab;
    }

    public override mark(context: CanvasRenderingContext2D, position: Point): void {
        const scale = context.getTransform().a;
        const size = this.size * scale;
        
        const dab = this.createDab(position, size);

        context.fillStyle = this.color.toString();
        context.fill(dab);
    }
}