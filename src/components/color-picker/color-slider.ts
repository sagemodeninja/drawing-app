import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';
import { HSL } from '../../classes';

@customComponent('color-slider')
export class ColorSlider extends CustomComponent {
    static styles = `
    `
    
    private _color: HSL;
    
    private _control: HTMLCanvasElement;
    
    private _context: CanvasRenderingContext2D;
    private _gradient: CanvasGradient;
    private _picking: boolean = false;
    private _normalColor: HSL;
    
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
        return `<canvas class="control" part="control" width="320" height="18"></canvas>`
    }

    public connectedCallback() {
        this._normalColor = new HSL(0, 100, 50);
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
        
        // Gradient
        this._gradient = this._context.createLinearGradient(18, 0, this._control.width - 12, 0);

        this._gradient.addColorStop(0, "hsl(0 100% 50%)");
        this._gradient.addColorStop(1 / 6, "hsl(60 100% 50%)");
        this._gradient.addColorStop(2 / 6, "hsl(120 100% 50%)");
        this._gradient.addColorStop(3 / 6, "hsl(180 100% 50%)");
        this._gradient.addColorStop(4 / 6, "hsl(240 100% 50%)");
        this._gradient.addColorStop(5 / 6, "hsl(300 100% 50%)");
        this._gradient.addColorStop(1, "hsl(0 100% 50%)");
    }

    private addEventListeners() {
        this._control.addEventListener('mousedown', ({ clientX }) => {
            this._picking = true;    
            this.handleInteractions(clientX);
        });

        document.addEventListener('mousemove', e => {
            if (this._picking) {
                e.preventDefault();
                this.handleInteractions(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this._picking) this._picking = false;
        });
    }

    private scaleCanvas() {
        const {devicePixelRatio} = window;
        const { width, height } = { width: 320, height: 18 };
        
        this._control.style.width = width + 'px';
        this._control.style.height = height + 'px';
        this._control.width = width * devicePixelRatio;
        this._control.height = height * devicePixelRatio;
        
        this._context.scale(devicePixelRatio, devicePixelRatio);
    }

    private handleInteractions (x: number) {
        const { left, width } = this._control.getBoundingClientRect();

        x = Math.max(12, Math.min(width - 12, x - left));

        const hue = Math.round(((x - 12) / (width - 24)) * 360);
        
        this._color.hue = hue;
        this._normalColor.hue = hue;

        this.dispatchEvent(new Event('change'));
        this.draw(x);
    }

    private updateColor(color: HSL) {
        const {width} = this.control;

        this._color = color;
        this._normalColor.hue = color.hue;
        this.draw(12 + ((color.hue / 360) * (width - 24)));
    }

    private draw(position: number) {
        const {width, height} = this.control;

        this._context.clearRect(0, 0, width, height);
        
        this._context.fillStyle = this._gradient;
        this._context.beginPath();
        this._context.roundRect(12, 5, width - 24, 8, 4);
        this._context.fill();

        // Outer ball
        this._context.fillStyle = '#fff';

        this._context.beginPath();
        this._context.arc(position, 9, 9, 0, 2 * Math.PI);
        this._context.fill();
        
        // Inner ball
        this._context.fillStyle = this._normalColor.toString();

        this._context.beginPath();
        this._context.arc(position, 9, 6, 0, 2 * Math.PI);
        this._context.fill();
    }
}