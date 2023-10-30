import { Point, Project } from '@/classes';
import { Rectangle } from '@/classes/rectangle';
import { DrawingCanvas } from '@/components/drawing-canvas';
import { StateObserver } from '../state-observer';
import { StateObservable } from '../state-observable';

export class Workspace extends StateObservable {
    private readonly _self: HTMLDivElement;
    
    private _bounds: Rectangle;
    private _rotation: number = 0;
    private _zoomFactor: number = 1;
    private _origin: Point = new Point(0, 0);
    
    private _projectObserver: StateObserver;
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

    get zoomFactor() {
        return this._zoomFactor;
    }

    public attachProject(project: Project) {
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

    private manageLayers(state: { action: string, layer: DrawingCanvas }) {
        const { action, layer } = state;

        if (action === 'add') {
            this.attachCanvas(layer.canvas);
            layer.attach(this);
        }
    }

    private attachCanvas(canvas: HTMLCanvasElement) {
        const {x, y} = this._origin.toScreen(this._bounds);
        
        canvas.style.top = y + 'px';
        canvas.style.left = x + 'px';

        this._self.append(canvas);
    }

    private handleRotation(e: KeyboardEvent) {
        if (e.code.includes('Bracket')) {
            const key = e.key.charCodeAt(0);
            const delta = (key - 92) * 10;

            this._rotation += delta;
            this.notify('rotation', this._rotation);
        }
    }

    private handleZoom(e: WheelEvent) {
        if (e.ctrlKey) {
            e.preventDefault();

            this._zoomFactor += e.deltaY * -0.001;
            this.notify('zoom', this._zoomFactor);
        }
    }

    private handlePanningTrigger(e: KeyboardEvent) {
        if (e.code === 'Space' && !this._panning) {
            this._panning = true;

            const handlePanning = this.handlePanning.bind(this);

            const cleanup = e => {
                if (e.code === 'Space') {
                    this._panning = false;

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
            document.removeEventListener('mousemove', handlePanning);
            document.removeEventListener('mouseup', cleanup);
        }

        document.addEventListener('mousemove', handlePanning);
        document.addEventListener('mouseup', cleanup);
    }
}
