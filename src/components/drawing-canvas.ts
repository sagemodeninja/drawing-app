import { HSL, Project, ProjectSettings, Workspace } from '@/classes';
import { StateObserver } from '@/classes/state-observer';

export class DrawingCanvas {
    private readonly _canvas: HTMLCanvasElement;
    
    private _workspaceObserver: StateObserver;
    private _workspace: Workspace;
    private _project: Project;
    private _projectSettings: ProjectSettings;
    private _context: CanvasRenderingContext2D;

    private _background: HSL;

    constructor(project: Project) {
        this._project = project;
        this._projectSettings = project.settings;

        this._canvas = document.createElement('canvas');

        this._context = this._canvas.getContext('2d');

        this._canvas.classList.add('drawingCanvas');
        this._background = HSL.fromHex('#ffffff');

        this.addEventListeners();
    }

    public get canvas() {
        return this._canvas;
    }

    public attach(workspace: Workspace) {
        this._workspace = workspace;
        this._workspaceObserver.observe(workspace);

        const { width, height } = this._projectSettings.canvasSize;

        this.scaleCanvas();
        this._context.fillStyle = this._background.toString();
        this._context.fillRect(0, 0, width, height);
    }

    public detach() {
        // this._project.state.unsubscribe(this);
    }

    private addEventListeners() {
        this._workspaceObserver = new StateObserver(this.observeWorkspace.bind(this));
    }

    private observeWorkspace(property: string, value: any) {
        const { style } = this._canvas;

        switch(property) {
            case 'rotation':
                style.transform = `translate(-50%, -50%) rotate(${value}deg)`;
                break;
            case 'origin':
                const { bounds } = this._workspace;
                const {x, y} = value.toScreen(bounds);
                
                style.top = y + 'px';
                style.left = x + 'px';
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