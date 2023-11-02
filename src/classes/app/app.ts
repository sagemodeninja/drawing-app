import '@/styles/main.scss';
import '@/components';

import { HSL, Project, Size, Workspace } from '@/classes';
import { CanvasLayer } from '@/classes/canvas-layer';
import { BrushTool, ColorPicker, StatusBar } from '@/components';
import { DefaultBrush } from '../brushes';

export class App {
    private readonly _workspace: Workspace;
    private readonly _statusBar: StatusBar;
    private readonly _colorPicker: ColorPicker;
    private readonly _brushTool: BrushTool;

    private _project: Project;

    constructor() {
        this._workspace = new Workspace('workspace');
        this._statusBar = document.getElementById('statusBar') as StatusBar;
        this._colorPicker = document.getElementById('colorPicker') as ColorPicker;
        this._brushTool = document.getElementById('brushTool') as BrushTool;
        
        this.addEventListeners();
    }

    public open() {
        const project = new Project();
        const defaultColor = new HSL(0, 0, 0);

        project.canvasSize = new Size(800, 500);
        project.brush = this._brushTool.brush;
        
        this._project = project;
        
        this._workspace.attachProject(this._project);
        this._statusBar.connect(this._workspace);
        
        project.addLayer(new CanvasLayer(project));
    }
    
    private addEventListeners() {
        this._colorPicker.addEventListener('change', () => {
            this._project.brush.color = this._colorPicker.color;
        })
    }
}