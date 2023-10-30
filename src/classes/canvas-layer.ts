import {
    HSL,
    Point,
    Project,
    Workspace
} from '@/classes';
import { DrawingData, DrawingDataPoint } from '@/classes/drawing-data';
import { StateObserver } from '@/classes/state-observer';
import { DefaultBrush } from './brushes';

export class CanvasLayer {
    private readonly _canvas: HTMLCanvasElement;
    private readonly _bufferCanvas: HTMLCanvasElement;
    
    private _workspace: Workspace;
    private _project: Project;
    private _context: CanvasRenderingContext2D;
    private _bufferContext: CanvasRenderingContext2D;
    
    private _workspaceObserver: StateObserver;
    private _background: HSL;
    private _lastPoint: Point;

    private _data: DrawingData[] = [];
    private _currentData: DrawingData;

    constructor(project: Project) {
        this._project = project;
        this._background = HSL.fromHex('#ffffff');

        this._canvas = document.createElement('canvas');
        this._bufferCanvas = document.createElement('canvas');
        
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
        this._bufferContext = this._bufferCanvas.getContext('2d');
        
        this.scaleCanvas(this._context, 1);
        this.scaleCanvas(this._bufferContext, 1);

        this.drawBackground();
    }

    private addEventListeners() {
        this._workspaceObserver = new StateObserver(this.observeWorkspace.bind(this));
        this._canvas.addEventListener('mousedown', this.handleDrawingTrigger.bind(this));
    }

    private scaleCanvas(context: CanvasRenderingContext2D, zoomFactor: number) {
        const canvas = context.canvas;
        const { width, height } = this._project.canvasSize;
        const pixelRatio = window.devicePixelRatio * zoomFactor;

        canvas.style.width = (width * zoomFactor) + 'px';
        canvas.style.height = (height * zoomFactor) + 'px';
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;

        context.scale(pixelRatio, pixelRatio);
    }

    private observeWorkspace(property: string, state: any) {
        switch(property) {
            case 'rotation': this.handleRotation(state); break;
            case 'zooming': this.handleZooming(state); break;
            case 'panning': this._canvas.style.pointerEvents = state ? 'none' : 'auto'; break;
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

    private handleZooming(state: boolean) {
        this._canvas.style.pointerEvents = state ? 'none' : 'auto';

        if (state) {
            const { width: sWidth, height: sHeight } = this._canvas;
            const { width: dWidth, height: dHeight } = this._bufferCanvas;

            this._bufferContext.drawImage(this._canvas, 0, 0, sWidth, sHeight, 0, 0, dWidth, dHeight);
        } else {
            this.drawBackground();

            this._data.forEach(data => {
                const brush = new DefaultBrush(1, HSL.fromHex(data.color));

                data.points.slice(1).forEach((point, index) => {
                    const lastPoint = data.points[index].point;
                    const points = this.interpolatePoints(lastPoint, point.point, point.size / 5);

                    points.forEach(point => brush.mark(this._context, point));
                });
            })
        }
    }

    private handleZoom(zoom: number) {
        const { origin } = this._workspace;
        const { width, height } = this._project.canvasSize;

        this.scaleCanvas(this._context, zoom);
        this.handlePanning(origin);
        
        this._context.clearRect(0, 0, width, height);
        this._context.drawImage(this._bufferCanvas, 0, 0);
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
        this._currentData = new DrawingData(brush.id, brush.color.toHex());

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
        const points = this.interpolatePoints(this._lastPoint ?? point, point, size / 5);

        points.forEach(point => brush.mark(this._context, point));

        const dataPoint = new DrawingDataPoint(brush.size, point);
        this._currentData.points.push(dataPoint);
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