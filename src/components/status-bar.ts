import { customComponent, query, CustomComponent } from '@sagemodeninja/custom-component';
import styles from '@/styles/status-bar.component.scss';
import { Workspace } from '@/classes';
import { StateObserver } from '@/classes/state-observer';

@customComponent('status-bar')
export class StatusBar extends CustomComponent {
    static styles = styles.toString();

    private _workspace: Workspace;
    private _workspaceObserver: StateObserver;

    @query('.zoomFactor')
    private _zoomFactorSpan: HTMLSpanElement;
    
    @query('.origin')
    private _originSpan: HTMLSpanElement;
    
    @query('.rotationLine')
    private _rotationLine: SVGLineElement;

    @query('.rotation')
    private _rotationSpan: HTMLSpanElement;

    public render() {
        return `
            <div class="statusItem">
                <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 10c0 1.71-.572 3.287-1.536 4.548l4.743 4.745a1 1 0 0 1-1.32 1.497l-.094-.083-4.745-4.743A7.5 7.5 0 1 1 17.5 10ZM10 5.5a1 1 0 0 0-1 1V9H6.5a1 1 0 1 0 0 2H9v2.5a1 1 0 1 0 2 0V11h2.5a1 1 0 1 0 0-2H11V6.5a1 1 0 0 0-1-1Z" />
                </svg> 
                <span class="zoomFactor">100%</span>
            </div>
            <div class="statusItem">
                <svg class="icon rotationIcon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="6" stroke-width="2" stroke="currentColor" fill="none" />
                    <line class="rotationLine" x1="9" y1="9" x2="9" y2="4" stroke-width="2" stroke="currentColor" />
                </svg>
                <span class="rotation">0°</span>
            </div> 
            <div class="statusItem">
                <svg class="icon originIcon" stroke="currentColor" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3,6.5 Q2.5,2.5 6.5,3 M11.5,3 Q15.5,2.5 15,6.5 M15,11.5 Q15.5,15.5 11.5,15 M3,11.5 Q2.5,15.5 6.5,15"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                    <circle cx="9" cy="9" r="2" stroke="none" />
                </svg>
                <span class="origin">0px, 0px</span>
            </div>
        `
    }

    public connectedCallback() {
        this._workspaceObserver = new StateObserver(this.observeWorkspace.bind(this));
    }

    public connect(workspace: Workspace) {
        this._workspace = workspace;
        this._workspaceObserver.observe(workspace);
        this.setStatus();
    }

    private observeWorkspace(property: string) {
        if (['origin', 'rotation', 'zoom'].includes(property)) {
            this.setStatus();
        }
    }

    private setStatus() {
        const { rotation, zoomFactor, origin } = this._workspace;
        const { x: rotationX, y: rotationY } = this.getPointAtRotation(9, 9, 5, rotation);
        const zoomLevel = Math.round(zoomFactor * 100);

        this._rotationLine.setAttribute('x2', rotationX);
        this._rotationLine.setAttribute('y2', rotationY);

        this._zoomFactorSpan.innerText = `${zoomLevel}%`;
        this._originSpan.innerText = `${origin.x}px, ${origin .y}px`;
        this._rotationSpan.innerText = `${rotation}°`;
    }

    private getPointAtRotation(cx, cy, radius, degrees) {
        var radians = ((degrees - 90) * Math.PI) / 180;
        
        var x = cx + radius * Math.cos(radians);
        var y = cy + radius * Math.sin(radians);
        
        return { x: x, y: y };
    }
}