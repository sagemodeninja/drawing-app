import {
    HSL,
    Point,
    Project,
    Workspace
} from '@/classes';
import { DrawingData, DrawingDataPoint } from '@/classes/drawing-data';
import { StateObserver } from '@/classes/state-observer';

export class DrawingCanvas {
    private readonly _canvas: HTMLCanvasElement;
    
    private _workspace: Workspace;
    private _project: Project;
    private _context: CanvasRenderingContext2D;
    
    private _workspaceObserver: StateObserver;
    private _background: HSL;
    private _lastPoint: Point;

    private _data: DrawingData[] = [];
    private _currentData: DrawingData;

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
        
        this.scaleCanvas(0);
        this.drawBackground();
    }

    private scaleCanvas(zoom: number) {
        const pixelRatio = window.devicePixelRatio;
        const { width, height } = this._project.settings.canvasSize;
        const { style } = this._canvas;

        const dw = width + zoom;
        const dh = height + (dw - width) / dw * height;

        style.width = dw + 'px';
        style.height = dh + 'px';
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
                const { x, y } = state.toScreen(bounds);
                
                style.top = y + 'px';
                style.left = x + 'px';
                break;
            case 'zoom': this.handleZoom(state); break;
        }
    }

    private handleZoom(zoom: number) {
        const { style } = this._canvas;
        const { bounds, origin } = this._workspace;
        const { x, y } = origin.toScreen(bounds);
        const { brush, canvasSize } = this._project.settings;
        
        const delta = zoom / 2;
        const dy = y - delta;
        const dx = x - (dy - y) / y * x;

        style.top = dy + 'px';
        style.left = dx + 'px';

        this.scaleCanvas(zoom);
        
        this._context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        this.drawBackground();
        this._data.forEach(data => {
            data.points.forEach(point => {
                brush.mark(this._context, point.point, point.size)
            })
        })
    }

    private handleDrawingTrigger(e: MouseEvent) {
        let isDrawing = true;

        const handleDrawing = (e) => isDrawing && this.handleDrawing(e);
        
        const toggleDrawing = () => isDrawing = !isDrawing;

        const cleanup = () => {
            this._data.push(this._currentData);
            this._currentData = null;
            this._lastPoint = null;

            this._canvas.removeEventListener('mousemove', handleDrawing);
            this._canvas.removeEventListener('mouseenter', toggleDrawing);
            this._canvas.removeEventListener('mouseleave', toggleDrawing);
            document.removeEventListener('mouseup', cleanup);
        }

        const { brush } = this._project.settings;
        this._currentData = new DrawingData(brush.id, '#000');

        this.handleDrawing(e);
        
        this._canvas.addEventListener('mousemove', handleDrawing);
        this._canvas.addEventListener('mouseenter', toggleDrawing);
        this._canvas.addEventListener('mouseleave', toggleDrawing);
        document.addEventListener('mouseup', cleanup);
    }

    private drawBackground() {
        const { canvasSize } = this._project.settings;
        const { width, height } = canvasSize;
        
        this._context.fillStyle = this._background.toString();
        this._context.fillRect(0, 0, width, height);
    }
    
    private handleDrawing({ clientX, clientY }: MouseEvent) {
        const { brush } = this._project.settings;
        const { left, top } = this._canvas.getBoundingClientRect();
    
        const x = clientX - left;
        const y = clientY - top;
        const point = new Point(x, y);

        const points = this.interpolatePoints(this._lastPoint ?? point, point, 1 / 2);
        points.forEach(point => brush.mark(this._context, point, 1));

        this._currentData.points.push(...points.map(point => new DrawingDataPoint(1, point)));
        this._lastPoint = point;
    }

    private interpolatePoints(start: Point, end: Point, spacing: number) {
        const points: Point[] = [];
        const distance = start.distanceTo(end);
        const count = Math.ceil(distance / spacing);
        
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const x = start.x + t * (end.x - start.x);
            const y = start.y + t * (end.y - start.y);
            
            points.push(new Point(x, y));
        }

        return [...points, end];
    }
}