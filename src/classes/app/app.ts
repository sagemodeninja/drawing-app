import '@/styles/main.scss';
import '@/components';

import { Project, Size, Workspace } from '@/classes';
import { DrawingCanvas } from '@/components/drawing-canvas';

export class App {
    private readonly _workspace: Workspace;
    // private readonly _colorPicker: ColorPicker;

    // private _drawing: boolean;
    // private _penColor: HSLColor;

    private _project: Project;
    private _panning: boolean = false;

    constructor() {
        this._workspace = new Workspace('workspace');
        this.addEventListeners();
        // this._colorPicker = document.getElementById('colorPicker') as ColorPicker;

        // this._penColor = HSLColor.fromHex('#000000');
        // this._colorPicker.color = this._penColor;
    }

    public open() {
        const project = new Project();

        this._project = project;
        project.settings.canvasSize = new Size(800, 500);

        this._workspace.attachProject(this._project);

        project.addLayer(new DrawingCanvas(project));
    }
    
    private addEventListeners() {}
}