import { Point, Project } from '@/classes';
import { Rectangle } from '@/classes/rectangle';
import { CanvasLayer } from '@/classes/canvas-layer';
import { StateObserver } from '../state-observer';
import { StateObservable } from '../state-observable';

export class Workspace extends StateObservable {
    private readonly _self: HTMLDivElement;
    
    private _bounds: Rectangle;
    private _rotation: number = 0;
    private _zoomFactor: number = 1;
    private _origin: Point = new Point(0, 0);
    
    private _project: Project;
    private _projectObserver: StateObserver;

    private _zooming: boolean;
    private _zoomDebouncer: any;
    private _panning: boolean;

    constructor(selector: string) {
        super();

        const self = document.getElementById(selector) as HTMLDivElement;
        const clientBounds = self.getBoundingClientRect();
        
        this._self = self;
        this._bounds = Rectangle.fromDOMRect(clientBounds);

        this.addEventListeners();
    }

    get bounds() {
        return this._bounds;
    }

    get rotation() {
        return this._rotation;
    }

    get zoomFactor() {
        return this._zoomFactor;
    }

    get origin() {
        return this._origin;
    }

    public attachProject(project: Project) {
        this._project = project;
        this._projectObserver.observe(project);
    }
    
    private addEventListeners() {
        this._projectObserver = new StateObserver(this.observeProject.bind(this));
        document.addEventListener('keypress', this.handleRotation.bind(this));
        document.addEventListener('wheel', this.handleZoom.bind(this), { passive: false });
        document.addEventListener('keydown', this.handlePanningTrigger.bind(this));
    }
    
    private observeProject(property: string, value: any) {
        switch (property) {
            case 'layer':
                this.manageLayers(value);
                break;
        }
    }

    private manageLayers(state: { action: string, layer: CanvasLayer }) {
        const { action, layer } = state;

        if (action === 'add') {
            this.attachCanvas(layer.canvas);
            layer.attach(this);
        }
    }

    private attachCanvas(canvas: HTMLCanvasElement) {
        const { x, y } = this._origin.toScreen(this._bounds);
        const { width, height } = this._project.canvasSize;
        
        canvas.style.left = (x - width / 2) + 'px';
        canvas.style.top = (y - height / 2) + 'px';

        this._self.append(canvas);
    }

    private handleRotation(e: KeyboardEvent) {
        if (e.code.includes('Bracket')) {
            const key = e.key.charCodeAt(0);
            const delta = (key - 92) * 15;

            this._rotation += delta;
            this._rotation = (this._rotation % 360 + 360) % 360;
            this.notify('rotation', this._rotation);
        }
    }

    private handleZoom(e: WheelEvent) {
        if (e.ctrlKey) {
            e.preventDefault();

            clearTimeout(this._zoomDebouncer);
            this._zoomDebouncer = setTimeout(() => this.setZooming(false), 200);

            this._zoomFactor += e.deltaY * -0.001;
            this._zoomFactor = Math.max(0.3, Math.min(8, this._zoomFactor));

            this.setZooming(true, e.deltaY);
            this.notify('zoom', this._zoomFactor);
        }
    }

    private handlePanningTrigger(e: KeyboardEvent) {
        if (e.code === 'Space' && !this._panning) {
            this.setPanning(true);
            
            const handlePanning = this.handlePanning.bind(this);

            const cleanup = e => {
                if (e.code === 'Space') {
                    this.setPanning(false);

                    document.removeEventListener('mousedown', handlePanning);
                    document.removeEventListener('keyup', cleanup);
                }
            }

            document.addEventListener('mousedown', handlePanning);
            document.addEventListener('keyup', cleanup);
        }
    }

    private handlePanning(e: MouseEvent) {
        const origin = this._origin;
        const { clientX: initX, clientY: initY } = e;
        const { x: startX, y: startY } = { ...origin };

        const handlePanning = ({clientX, clientY}) => {
            const deltaX = clientX - initX;
            const deltaY = clientY - initY;

            origin.x = startX + deltaX;
            origin.y = startY - deltaY;
            
            this.notify('origin', origin);
        } 

        const cleanup = () => {
            this._self.style.cursor = this._panning ? 'grab' : 'initial'; 
            document.removeEventListener('mousemove', handlePanning);
            document.removeEventListener('mouseup', cleanup);
        }

        this._self.style.cursor = 'grabbing'; 
        document.addEventListener('mousemove', handlePanning);
        document.addEventListener('mouseup', cleanup);
    }

    private setZooming(zooming: boolean, delta?: number) {
        if (zooming === this._zooming) return;

        const cursor = delta > 0 ? 'zoom-out' : 'zoom-in';

        this._zooming = zooming;
        this._self.style.cursor = zooming ? cursor : 'initial';
        this.notify('zooming', zooming);
    }

    private setPanning(panning: boolean) {  
        this._panning = panning;
        this._self.style.cursor = panning ? 'grab' : 'initial';
        this.notify('panning', panning);
    }
}
