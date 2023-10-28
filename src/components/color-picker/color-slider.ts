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
        return `<canvas class="control" part="control" width="200" height="18"></canvas>`
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
        this._context = this.control.getContext('2d', { willReadFrequently: true });
        
        this.scaleCanvas();
        
        // Gradient
        this._gradient = this._context.createLinearGradient(9, 0, this._control.width - 18, 0);

        this._gradient.addColorStop(0, "hsl(0 100% 50%)");
        this._gradient.addColorStop(1 / 7, "hsl(60 100% 50%)");
        this._gradient.addColorStop(2 / 7, "hsl(120 100% 50%)");
        this._gradient.addColorStop(3 / 7, "hsl(180 100% 50%)");
        this._gradient.addColorStop(4 / 7, "hsl(240 100% 50%)");
        this._gradient.addColorStop(5 / 7, "hsl(300 100% 50%)");
        this._gradient.addColorStop(1, "hsl(0 100% 50%)");
    }

    private addEventListeners() {
        const handleUpdates = (x: number) => {
            this._picking = true;
            
            const { left, width } = this._control.getBoundingClientRect();

            x = Math.max(9, Math.min(width - 18, x - left));

            const hue = Math.round(((x - 9) / (width - 18 - 9)) * 360);
            
            this._color.hue = hue;
            this._normalColor.hue = hue;

            this.dispatchEvent(new Event('change'));
            this.draw(x);
        }

        this._control.addEventListener('mousedown', ({ clientX }) => {
            handleUpdates(clientX);
        });

        document.addEventListener('mousemove', ({ clientX }) => {
            if (this._picking) handleUpdates(clientX);
        });

        document.addEventListener('mouseup', () => {
            if (this._picking) this._picking = false;
        });
    }

    private scaleCanvas() {
        const {devicePixelRatio} = window;
        const { width, height } = { width: 200, height: 30 };
        
        this._control.style.width = width + 'px';
        this._control.style.height = height + 'px';
        this._control.width = width * devicePixelRatio;
        this._control.height = height * devicePixelRatio;
        
        this._context.scale(devicePixelRatio, devicePixelRatio);
    }

    private updateColor(color: HSL) {
        const {width} = this.control;

        this._color = color;
        this._normalColor.hue = color.hue;
        this.draw(9 + ((color.normalize().hue / 360) * (width - 18)));
    }

    private draw(position: number) {
        const {width, height} = this.control;

        this._context.clearRect(0, 0, width, height);
        
        this._context.fillStyle = this._gradient;
        this._context.beginPath();
        this._context.roundRect(9, 5, width - 18, 8, 4);
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