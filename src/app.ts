import '@/styles/main.scss';
import '@/components';

import { HSL, Project, Size, Workspace } from '@/classes';
import { ColorPicker } from '@/components';
import { HEX } from './classes/colors/hex-color';
import { DrawingCanvas } from './components/drawing-canvas';

class App {
    private readonly _workspace: Workspace;
    // private readonly _canvas: HTMLCanvasElement;
    // private readonly _colorPicker: ColorPicker;

    // private _context: CanvasRenderingContext2D;
    // private _drawing: boolean;
    // private _penColor: HSLColor;

    private _project: Project;
    private _panning: boolean = false;

    constructor() {
        this._workspace = new Workspace('workspace');

        this.addEventListeners();
        // this._canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
        // this._colorPicker = document.getElementById('colorPicker') as ColorPicker;

        // this._penColor = HSLColor.fromHex('#000000');
    }

    // public init() {
    //     this._colorPicker.color = this._penColor;
    //     this.initCanvas();
    // }

    public open() {
        const project = new Project();

        this._project = project;
        project.settings.canvasSize = new Size(800, 500);

        this._workspace.attachProject(this._project);

        project.addLayer(new DrawingCanvas(project));
    }
    
    private initCanvas() {
        // this._context = this._canvas.getContext('2d');
        // this.scaleCanvas();
    }
    
    private scaleCanvas() {
        // const pixelRatio = window.devicePixelRatio;
        // const { width, height } = this._canvas.getBoundingClientRect();
        
        // this._canvas.width = width * pixelRatio;
        // this._canvas.height = height * pixelRatio;
        
        // this._context.scale(pixelRatio, pixelRatio);
    }
    
    private addEventListeners() {
        // const { left, top } = this._canvas.getBoundingClientRect();
        // let lastPoints = { x: 0, y: 0 };
        
        // this._canvas.addEventListener('mousedown', ({ clientX, clientY }) => {
        //     this._drawing = true;
            
        //     const x = clientX - left;
        //     const y = clientY - top;

        //     lastPoints = { x, y };
        // })

        // document.addEventListener('mousemove', ({ clientX, clientY }) => {
        //     if (!this._drawing) return;

        //     const x = clientX - left;
        //     const y = clientY - top;

        //     this._context.lineWidth = 1;
        //     // this._context.lineCap = 'round';
        //     this._context.strokeStyle = this._penColor.toString();
        //     this._context.beginPath();
        //     this._context.moveTo(lastPoints.x, lastPoints.y);
        //     this._context.lineTo(x, y);
        //     this._context.stroke();

        //     lastPoints = { x, y };
        // })

        // this._canvas.addEventListener('mouseup', () => {
        //     this._drawing = false;
        // })

        // this._colorPicker.addEventListener('change', () => {
        //     this._penColor = this._colorPicker.color;
        // })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();

    app.open();
})