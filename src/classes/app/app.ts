import '@/styles/main.scss';
import '@/components';

import { HSL, Project, Size, Workspace } from '@/classes';
import { DrawingCanvas } from '@/components/drawing-canvas';
import { ColorPicker } from '@/components';
import { DefaultBrush } from '../brushes';

export class App {
    private readonly _workspace: Workspace;
    private readonly _colorPicker: ColorPicker;

    private _project: Project;

    constructor() {
        this._workspace = new Workspace('workspace');
        this._colorPicker = document.getElementById('colorPicker') as ColorPicker;
        
        this.addEventListeners();
    }

    public open() {
        const project = new Project();
        const defaultColor = new HSL(0, 0, 0);

        project.canvasSize = new Size(800, 500);
        project.brush = new DefaultBrush(1, defaultColor);
        
        this._project = project;
        this._workspace.attachProject(this._project);

        project.addLayer(new DrawingCanvas(project));
    }
    
    private addEventListeners() {
        this._colorPicker.addEventListener('change', () => {
            this._project.brush.color = this._colorPicker.color;
        })
    }
}