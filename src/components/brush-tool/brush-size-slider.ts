import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';
import { state, STATE_PROPERTIES_KEY } from '@/classes/decorators';
import styles from '@/styles/brush-size-slider.component.scss';

@customComponent('brush-size-slider')
export class BrushSizeSlider extends CustomComponent {
    static styles = styles.toString();

    static get observedAttributes() {
        return Reflect.getMetadata(STATE_PROPERTIES_KEY, BrushSizeSlider.prototype);
    }
 
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    constructor() {
        super(); 
    }

    public render() {
        return `
            <div class="control">
                <canvas class="canvas"></canvas>
            </div>
        `
    }
  
    // State
    @state()
    public width: number;
    
    @state()
    public height: number;

    public connectedCallback() {
        this.initCanvas();
        this.renderSlider();

        console.dir(this);
        this.width = 1000;
    }

    public attributeChangedCallback(prop: string, _, value: any) { 
        this[prop] = value;
    }

    private onStateChanged(property: string, oldValue: any, newValue: any) {
        
    }

    private initCanvas() {
        this._canvas = this.shadowRoot.querySelector('.canvas');
        this._context = this._canvas.getContext('2d');

        this.scaleCanvas();
    }

    private scaleCanvas() {
        const { width, height } = this._canvas.getBoundingClientRect();

        // const { width, height } = this._project.canvasSize;
        // const scaleFactor = (96 / 96) + window.devicePixelRatio;

        // context.canvas.style.width = width + 'px';
        // context.canvas.style.height = height + 'px';
        // context.canvas.width = width * scaleFactor;
        // context.canvas.height = height * scaleFactor;

        // context.scale(scaleFactor, scaleFactor);
    }

    private renderSlider() {

    }
}