import {
    HSL,
    Point,
    Project,
    Workspace
} from '@/classes';
import { StateObserver } from '@/classes/state-observer';

export class DrawingCanvas {
    private readonly _canvas: HTMLCanvasElement;
    
    private _workspace: Workspace;
    private _project: Project;
    private _context: CanvasRenderingContext2D;
    
    private _workspaceObserver: StateObserver;
    private _background: HSL;
    private _lastPoint: Point;

    constructor(project: Project) {
        this._project = project;
        this._background = HSL.fromHex('#ffffff');

        this._canvas = document.createElement('canvas');
        
        this.initCanvas();
        this.addEventListeners();
    }

    public get canvas() {
        return this._canvas;
    }

    public attach(workspace: Workspace) {
        this._workspace = workspace;
        this._workspaceObserver.observe(workspace);
    }

    private initCanvas() {
        this._canvas.classList.add('drawingCanvas');
        this._context = this._canvas.getContext('2d');
        
        this.scaleCanvas();
        this.drawBackground();
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

    private addEventListeners() {
        this._workspaceObserver = new StateObserver(this.observeWorkspace.bind(this));
        this._canvas.addEventListener('mousedown', this.handleDrawingTrigger.bind(this));

        // this._colorPicker.addEventListener('change', () => {
        //     this._penColor = this._colorPicker.color;
        // })
    }

    private observeWorkspace(property: string, state: any) {
        const { style } = this._canvas;

        switch(property) {
            case 'rotation':
                style.transform = `translate(-50%, -50%) rotate(${state}deg)`;
                break;
            case 'origin':
                const { bounds } = this._workspace;
                const {x, y} = state.toScreen(bounds);
                
                style.top = y + 'px';
                style.left = x + 'px';
                break;
            case 'zoom': this.handleZoom(state); break;
        }
    }

    private handleZoom(zoom: number) {
        zoom += window.devicePixelRatio;

        this._context.save();
        this.drawBackground();
        this._context.scale(zoom, zoom);
        this._context.restore();
    }

    private handleDrawingTrigger(e: MouseEvent) {
        let isDrawing = true;

        const handleDrawing = (e) => isDrawing && this.handleDrawing(e);
        
        const toggleDrawing = () => isDrawing = !isDrawing;

        const cleanup = () => {
            this._lastPoint = null;

            this._canvas.removeEventListener('mousemove', handleDrawing);
            this._canvas.removeEventListener('mouseenter', toggleDrawing);
            this._canvas.removeEventListener('mouseleave', toggleDrawing);
            document.removeEventListener('mouseup', cleanup);
        }

        this.handleDrawing(e);
        
        this._canvas.addEventListener('mousemove', handleDrawing);
        this._canvas.addEventListener('mouseenter', toggleDrawing);
        this._canvas.addEventListener('mouseleave', toggleDrawing);
        document.addEventListener('mouseup', cleanup);
    }
    
    private handleDrawing({ clientX, clientY }: MouseEvent) {
        const { brush } = this._project.settings;
        const { left, top } = this._canvas.getBoundingClientRect();
    
        const x = clientX - left;
        const y = clientY - top;
        const point = new Point(x, y);

        if (this._lastPoint) {
            const distance = this._lastPoint.distanceTo(point);
            const count = Math.ceil(distance / (1 / 2));
            
            for (let i = 0; i <= count; i++) {
                const t = i / count;
                const x = this._lastPoint.x + t * (point.x - this._lastPoint.x);
                const y = this._lastPoint.y + t * (point.y - this._lastPoint.y);
                
                brush.mark(this._context, new Point(x, y), 1);
            }
        } else {
            brush.mark(this._context, point, 1);
        }


        this._lastPoint = point;
    }

    private drawBackground() {
        const { canvasSize } = this._project.settings;
        const { width, height } = canvasSize;
        
        this._context.fillStyle = this._background.toString();
        this._context.fillRect(0, 0, width, height);
    }
}