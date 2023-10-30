import {
    HSL,
    Point,
    Project,
    Rectangle,
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
        
        this.scaleCanvas(1);
        this.drawBackground();
    }

    private addEventListeners() {
        this._workspaceObserver = new StateObserver(this.observeWorkspace.bind(this));
        this._canvas.addEventListener('mousedown', this.handleDrawingTrigger.bind(this));
    }

    private scaleCanvas(zoomFactor: number) {
        const pixelRatio = window.devicePixelRatio * zoomFactor;
        const { width, height } = this._project.canvasSize;
        const { style } = this._canvas;

        style.width = (width * zoomFactor) + 'px';
        style.height = (height * zoomFactor) + 'px';
        this._canvas.width = width * pixelRatio;
        this._canvas.height = height * pixelRatio;

        this._context.scale(pixelRatio, pixelRatio);
    }

    private observeWorkspace(property: string, state: any) {
        switch(property) {
            case 'rotation': this.handleRotation(state); break;
            case 'zooming':
            case 'panning':
                this._canvas.style.pointerEvents = state ? 'none' : 'auto';
                break;
            case 'origin': this.handlePanning(state); break;
            case 'zoom': this.handleZoom(state); break;
        }
    }

    private handleRotation(angle: number) {
        this._canvas.style.transform = `rotate(${angle}deg)`;
    }

    private handlePanning(origin: Point) {
        const { canvasSize } = this._project;
        const { bounds, zoomFactor } = this._workspace;
        const { x, y } = origin.toScreen(bounds);
        const { style } = this._canvas;

        const top = y - (canvasSize.height * zoomFactor) / 2;
        const left = x - (canvasSize.width * zoomFactor) / 2;
        
        style.top = top + 'px'; 
        style.left = left + 'px'; 
    }

    private handleZoom(zoom: number) {
        const { origin } = this._workspace;
        const { brush, canvasSize } = this._project;

        this.scaleCanvas(zoom);
        this.handlePanning(origin);
        
        this._context.clearRect(0, 0, canvasSize.width, canvasSize.height);

        this.drawBackground();

        this._data.forEach(data => {
            const path = new Path2D();

            data.points.forEach(({point, size}) => brush.createDab(point, size * zoom, path));

            this._context.fillStyle = data.color;
            this._context.fill(path);
        })
    }

    private handleDrawingTrigger(e: MouseEvent) {
        let isDrawing = true;

        const handleDrawing = (e) => isDrawing && this.handleDrawing(e);
        
        const toggleDrawing = () => {
            this._lastPoint = null;
            isDrawing = !isDrawing
        };
 
        const cleanup = () => {
            this._data.push(this._currentData);
            this._currentData = null;
            this._lastPoint = null;

            this._canvas.removeEventListener('mousemove', handleDrawing);
            this._canvas.removeEventListener('mouseenter', toggleDrawing);
            this._canvas.removeEventListener('mouseleave', toggleDrawing);
            document.removeEventListener('mouseup', cleanup);
        }

        const { brush } = this._project;
        this._currentData = new DrawingData(brush.id, brush.color.toString());

        this.handleDrawing(e);
        
        this._canvas.addEventListener('mousemove', handleDrawing);
        this._canvas.addEventListener('mouseenter', toggleDrawing);
        this._canvas.addEventListener('mouseleave', toggleDrawing);
        document.addEventListener('mouseup', cleanup);
    }

    private drawBackground() {
        const { canvasSize } = this._project;
        const { width, height } = canvasSize;
        
        this._context.fillStyle = this._background.toString();
        this._context.fillRect(0, 0, width, height);
    }
    
    private handleDrawing({ clientX, clientY }: MouseEvent) {
        const { canvasSize, brush } = this._project;
        const { bounds, rotation, zoomFactor, origin } = this._workspace;

        const rotatePoint = (angle) => {
            const { x: centerX, y: centerY } = origin.toScreen(bounds);

            const gx = (clientX - centerX) / zoomFactor;
            const gy = (clientY - centerY) / zoomFactor;

            const radians = angle * (Math.PI / 180);

            const sin = Math.sin(radians);
            const cos = Math.cos(radians);
            let x = (gx * cos) + (gy * sin);
            let y = (-gx * sin) + (gy * cos);
    
            x = Math.floor(x * 100) / 100;
            y = Math.floor(y * 100) / 100;
        
            return new Point(x, y);
        }

        const { x: rotatedX, y: rotatedY } = rotatePoint(rotation);
        const x = rotatedX + canvasSize.width / 2;
        const y = rotatedY + canvasSize.height / 2;

        const size = brush.size * zoomFactor;
        const point = new Point(x, y);
        const points = this.interpolatePoints(this._lastPoint ?? point, point, size / 2);

        points.forEach(point => brush.mark(this._context, point));

        this._currentData.points.push(...points.map(point => new DrawingDataPoint(size, point)));
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