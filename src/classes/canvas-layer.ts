import {
    HSL,
    Point,
    Project,
    Size,
    Workspace
} from '@/classes';
import { DrawingData, DrawingDataPoint } from '@/classes/drawing-data';
import { StateObserver } from '@/classes/state-observer';

export class CanvasLayer {
    private readonly _canvas: HTMLCanvasElement;
    
    private _workspace: Workspace;
    private _project: Project;
    private _context: CanvasRenderingContext2D;
    
    private _workspaceObserver: StateObserver;
    private _background: HSL;
    private _lastPoint: Point;

    private _data: DrawingData[] = [];
    private _currentData: DrawingData;

    private _cellSize: Size;
    private _debugPoint: Point;

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
        this._canvas.classList.add('layerCanvas');
        this._context = this._canvas.getContext('2d');

        const min = 150;
        const { width, height } = this._project.canvasSize;
        const cellWidth = this.calculateCellLength(width, min);
        const cellHeight = this.calculateCellLength(height, min);

        this._cellSize = new Size(cellWidth, cellHeight);
        this._debugPoint = new Point(0, 0);
        
        this.scaleCanvas(this._context);
        this.drawBackground();

        // Initial
        this.debugGrid();
    }

    private addEventListeners() {
        this._workspaceObserver = new StateObserver(this.observeWorkspace.bind(this));
        this._canvas.addEventListener('mousedown', this.handleDrawingTrigger.bind(this));

        this._canvas.addEventListener('mousemove', e => {
            const { top, left } = this._canvas.getBoundingClientRect();
            
            this._debugPoint.x = e.clientX - left;
            this._debugPoint.y = e.clientY - top;

            this.drawBackground();
            this.debugGrid();
        })
    }

    private observeWorkspace(property: string, state: any) {
        switch(property) {
            case 'origin':
                this.handlePanning(state);
                break;
            case 'rotation':
            case 'zoom':
                this.transformCanvas();
                break;
            case 'zooming':
            case 'panning':
                this._canvas.style.pointerEvents = state ? 'none' : 'auto';
                break;
        }
    }

    private handlePanning(origin: Point) {
        const { bounds } = this._workspace;
        const { x, y } = origin.toScreen(bounds);
        const { canvasSize } = this._project;

        const top = y - (canvasSize.height) / 2;
        const left = x - (canvasSize.width) / 2;
        
        this._canvas.style.top = top + 'px';
        this._canvas.style.left = left + 'px';
    }

    private transformCanvas() {
        const { rotation, zoomFactor } = this._workspace;

        this._canvas.style.transform = `scale(${zoomFactor}) rotate(${rotation}deg)`;
        this._canvas.style.imageRendering = zoomFactor < 2 ? 'auto' : 'pixelated';
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

        const size = brush.size;
        const point = new Point(x, y);
        const points = this.interpolatePoints(this._lastPoint ?? point, point, size / 5);

        points.forEach(point => brush.mark(this._context, point));

        const dataPoint = new DrawingDataPoint(brush.size, point);
        this._currentData.points.push(dataPoint);
        this._lastPoint = point;
    }

    private scaleCanvas(context: CanvasRenderingContext2D) {
        const { width, height } = this._project.canvasSize;
        const scaleFactor = (96 / 96) + window.devicePixelRatio;

        context.canvas.style.width = width + 'px';
        context.canvas.style.height = height + 'px';
        context.canvas.width = width * scaleFactor;
        context.canvas.height = height * scaleFactor;

        context.scale(scaleFactor, scaleFactor);
    }

    private drawBackground() {
        const { width, height } = this._project.canvasSize;
        
        // Clear
        this._context.clearRect(0, 0, width, height);
        
        // Background
        this._context.fillStyle = this._background.toString();
        this._context.fillRect(0, 0, width, height);
    }

    private debugGrid() {
        const { width, height } = this._project.canvasSize;
        const { width: cellWidth, height: cellHeight } = this._cellSize;
        const { x, y } = this._debugPoint;

        const debugCol = Math.floor(x / cellWidth);
        const debugRow = Math.floor(y / cellHeight);

        this._context.strokeStyle = 'blue';
        this._context.beginPath();
        this._context.arc(x, y, 10, 0, Math.PI * 180)
        this._context.stroke();

        // Grid
        const colCount = width / this._cellSize.width;
        const rowCount = height / this._cellSize.height;

        this._context.strokeStyle = 'red';
        this._context.beginPath();

        // Legend
        this._context.font = `15px sans-serif`;
        this._context.textAlign = 'center';
        this._context.textBaseline = 'top';

        for (let row = 0; row <= rowCount; row++) {
            const top = (row + 1) * this._cellSize.height;
            const textTop = row * this._cellSize.height;

            this._context.moveTo(0, top)
            this._context.lineTo(width, top);
            
            for (let col = 0; col <= colCount; col++) {
                const left = (col + 1) * this._cellSize.width;
                const textLeft = col * this._cellSize.width;

                this._context.moveTo(left, 0)
                this._context.lineTo(left, height);

                const label = (col + 1) + (row * colCount);

                this._context.fillStyle = (col === debugCol && row === debugRow) ? 'blue' : 'red';
                this._context.fillText(label.toString(), textLeft + 15, textTop + 15);
            }
        }

        this._context.stroke();
    }

    private calculateCellLength(length: number, minimum: number) {
        const initial = Math.floor(length / minimum);

        const resolveX = (x: number) => {
            if (x <= 1) return 1;
            return (length % x) > 0 ? resolveX(x - 1) : x;
        }

        return length / resolveX(initial);
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