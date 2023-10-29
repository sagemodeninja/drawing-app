import { IBrush } from '@/interfaces';
import { Size, HSL } from '@/classes';
import { StateObservable } from './state-observable';

export class ProjectSettings extends StateObservable {
    canvasSize: Size;
    brush: IBrush;
    brushSize: number;
    brushColor: HSL;
}