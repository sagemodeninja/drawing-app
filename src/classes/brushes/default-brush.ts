import { IBrush } from '@/interfaces';

export class DefaultBrush implements IBrush {
    id: string;

    generateDab(): Path2D {
        throw new Error('Method not implemented.');
    }

    mark(): void {
        throw new Error('Method not implemented.');
    }
}