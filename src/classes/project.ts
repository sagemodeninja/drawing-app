import {
    ProjectSettings,
    ProjectState,
    ProjectWorkspace,
    Size
} from '@/classes';
import { DrawingCanvas } from '@/components/drawing-canvas';

export class Project {
    private readonly _layers: DrawingCanvas[];
    
    public settings: ProjectSettings;
    public state: ProjectState;
    public workspace: ProjectWorkspace;

    constructor(workspace: HTMLDivElement) {
        this.settings = new ProjectSettings();
        this.state = new ProjectState();
        this.workspace = new ProjectWorkspace(workspace, this);

        this._layers = [new DrawingCanvas(this)];
    }

    public open() {
        this.settings.canvasSize = new Size(800, 500);
        this._layers.forEach(layer => layer.attach());
    }
}