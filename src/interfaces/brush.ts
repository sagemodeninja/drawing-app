export interface IBrush {
    id: string;
    generateDab(): Path2D;
    mark(): void;
}