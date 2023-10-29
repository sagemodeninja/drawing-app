import { HSLColor, Project, ProjectSettings } from '@/classes';
import { IStateObserver } from '@/interfaces';

export class DrawingCanvas implements IStateObserver {
    private readonly _canvas: HTMLCanvasElement;
    
    private _project: Project;
    private _projectSettings: ProjectSettings;
    private _context: CanvasRenderingContext2D;

    private _background: HSLColor;

    constructor(project: Project) {
        this._project = project;
        this._projectSettings = project.settings;

        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');

        this._canvas.classList.add('drawingCanvas');
        this._background = HSLColor.fromHex('#ffffff');
    }

    public attach() {
        const {state, workspace} = this._project;

        state.addObserver(this);
        workspace.attachCanvas(this._canvas);

        const { width, height } = this._projectSettings.canvasSize;

        this.scaleCanvas();
        this._context.fillStyle = this._background.toString();
        this._context.fillRect(0, 0, width, height);
    }

    public detach() {
        this._project.state.removeObserver(this);
    }

    public updateState(property: string, value: any) {
        switch(property) {
            case 'rotation':
                this._canvas.style.transform = `translate(-50%, -50%) rotate(${value}deg)`;
                break;
        }
    }

    private scaleCanvas() {
        const pixelRatio = window.devicePixelRatio;
        const { width, height } = this._project.settings.canvasSize;
        
        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
        this._canvas.width = width * pixelRatio;
        this._canvas.height = height * pixelRatio;
        
        this._context.scale(pixelRatio, pixelRatio);
    }
}