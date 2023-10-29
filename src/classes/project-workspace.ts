import { Project } from '@/classes';
import { Rectangle } from '@/classes/rectangle';

export class ProjectWorkspace {
    private readonly _self: HTMLDivElement;
    private readonly _project: Project;

    private _bounds: Rectangle;

    constructor(self: HTMLDivElement, project: Project) {
        this._self = self;
        this._project = project;

        const clientBounds = self.getBoundingClientRect();
        this._bounds = Rectangle.fromDOMRect(clientBounds);
    }

    public attachCanvas(canvas: HTMLCanvasElement) {
        const {origin} = this._project.state;
        const {x, y} = origin.toScreen(this._bounds);
        
        canvas.style.top = y + 'px';
        canvas.style.left = x + 'px';

        this._self.append(canvas);
    }
}