import { HSL } from '@/classes';
import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';

@customComponent('color-palette')
export class ColorPalette extends CustomComponent {
    static styles = `
        :host {
            padding: 0 12px;
        }

        .control {
            border-radius: 8px;
            overflow: hidden;
        }
    `

    private _color: HSL;
    
    private _control: HTMLCanvasElement;

    private _context: CanvasRenderingContext2D;
    private _verticalGradient: CanvasGradient;
    private _horizontalGradient: CanvasGradient;
    private _picking: boolean = false;
    
    // States
    public get color() {
        return this._color;
    }

    public set color(value: HSL) {
        this.updateColor(value);
    }

    // DOM
    private get control() {
        this._control ??= this.shadowRoot.querySelector('.control');
        return this._control;
    }

    public render() {
        return `<canvas class="control" part="control" width="296" height="200"></canvas>`
    }

    public connectedCallback() {
        this.initCanvas();
        this.addEventListeners();
    }

    public attributeChangedCallback(name: string, _, value: any) {
        switch(name) {
            case 'color': this.updateColor(value); break;
        }
    }

    private initCanvas() {
        this._context = this.control.getContext('2d');
        
        this.scaleCanvas();
        
        // Horizontal Gradient
        this._verticalGradient = this._context.createLinearGradient(0, 0, 0, this._control.height);

        this._verticalGradient.addColorStop(0, 'rgba(0,0,0,0)');
        this._verticalGradient.addColorStop(1, '#000');
    }

    private addEventListeners() {
        this._control.addEventListener('mousedown', this.handleInteractions.bind(this));

        document.addEventListener('mousemove', e => {
            e.preventDefault();
            if (this._picking) this.handleInteractions(e);
        });

        document.addEventListener('mouseup', () => {
            this._picking = false;
        });
    }

    private scaleCanvas() {
        const {devicePixelRatio} = window;
        const { width, height } = { width: 296, height: 200 };
        
        this._control.style.width = width + 'px';
        this._control.style.height = height + 'px';
        this._control.width = width * devicePixelRatio;
        this._control.height = height * devicePixelRatio;
        
        this._context.scale(devicePixelRatio, devicePixelRatio);
    }

    private handleInteractions ({clientX, clientY}: MouseEvent) {
        this._picking = true;

        const {left, top, width, height} = this._control.getBoundingClientRect();

        const x = Math.max(0, Math.min(width, clientX - left));
        const y = Math.max(0, Math.min(height, clientY - top));

        const saturation = Math.round((x / width) * 100);
        const lightness = Math.round(50 - ((y / height) * 50));

        this.color.saturation = saturation;
        this.color.lightness = lightness;

        this.dispatchEvent(new Event('change'));
        this.draw(x, y);
    }

    private updateColor(color: HSL) {
        const normal = color.normalize();
        const {width, height} = this.control;

        this._color = color;

        this._horizontalGradient = this._context.createLinearGradient(0, 0, this._control.width, 0);
        this._horizontalGradient.addColorStop(0, '#fff');
        this._horizontalGradient.addColorStop(1, normal.toString());

        const x = Math.round((color.saturation / 100) * width);
        const y = height - Math.round((color.lightness / 50) * height);

        this.draw(x, y);
    }

    private draw(x: number, y: number) {
        const {width, height} = this.control;

        this._context.clearRect(0, 0, width, height);
        
        this._context.fillStyle = this._horizontalGradient;
        this._context.fillRect(0, 0, width, height);
        
        this._context.fillStyle = this._verticalGradient;
        this._context.fillRect(0, 0, width, height);

        // Outer ball
        this._context.fillStyle = '#fff';

        this._context.beginPath();
        this._context.arc(x, y, 9, 0, 2 * Math.PI);
        this._context.fill();
        
        // Inner ball
        this._context.fillStyle = this._color.toString();

        this._context.beginPath();
        this._context.arc(x, y, 6, 0, 2 * Math.PI);
        this._context.fill();
    }
}