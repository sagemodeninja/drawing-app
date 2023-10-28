import './css/main.scss';
import './components/color-picker/color-picker';
import { ColorPicker } from './components/color-picker/color-picker';
import { HSL } from './classes';

class App {
    private readonly _canvas: HTMLCanvasElement;
    private readonly _colorPicker: ColorPicker;

    private _context: CanvasRenderingContext2D;
    private _drawing: boolean;
    private _penColor: HSL;

    constructor() {
        this._canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
        this._colorPicker = document.getElementById('colorPicker') as ColorPicker;

        this._penColor = HSL.fromHex('#000000');
    }

    public init() {
        this._colorPicker.color = this._penColor;
        this.initCanvas();
        this.addEventListeners();
    }

    public start() {
    }
    
    private initCanvas() {
        this._context = this._canvas.getContext('2d');
        this.scaleCanvas();
    }
    
    private scaleCanvas() {
        const pixelRatio = window.devicePixelRatio;
        const { width, height } = this._canvas.getBoundingClientRect();
        
        this._canvas.width = width * pixelRatio;
        this._canvas.height = height * pixelRatio;
        
        this._context.scale(pixelRatio, pixelRatio);
    }
    
    private addEventListeners() {
        const { left, top } = this._canvas.getBoundingClientRect();
        let lastPoints = { x: 0, y: 0 };
        
        this._canvas.addEventListener('mousedown', ({ clientX, clientY }) => {
            this._drawing = true;
            
            const x = clientX - left;
            const y = clientY - top;

            lastPoints = { x, y };
        })

        document.addEventListener('mousemove', ({ clientX, clientY }) => {
            if (!this._drawing) return;

            const x = clientX - left;
            const y = clientY - top;

            this._context.lineWidth = 1;
            // this._context.lineCap = 'round';
            this._context.strokeStyle = this._penColor.toString();
            this._context.beginPath();
            this._context.moveTo(lastPoints.x, lastPoints.y);
            this._context.lineTo(x, y);
            this._context.stroke();

            lastPoints = { x, y };
        })

        this._canvas.addEventListener('mouseup', () => {
            this._drawing = false;
        })

        this._colorPicker.addEventListener('change', () => {
            this._penColor = this._colorPicker.color;
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();

    app.init();
    app.start();
})