import { IBrush } from '@/interfaces';
import { Point } from '../point';
import { HSL } from '../colors';

export abstract class BaseBrush implements IBrush {
    abstract id: string;
    
    constructor(public size: number, public color: HSL) {}

    abstract createDab(position: Point, size: number, path?: Path2D): Path2D;
    
    abstract mark(context: CanvasRenderingContext2D, position: Point): void;
}