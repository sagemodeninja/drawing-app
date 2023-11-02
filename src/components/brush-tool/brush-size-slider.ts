import { CustomComponent, customComponent, property, query } from '@sagemodeninja/custom-component';
import { Rectangle } from '@/classes';
import styles from '@/styles/brush-size-slider.component.scss';

@customComponent('brush-size-slider')
export class BrushSizeSlider extends CustomComponent {
    static styles = styles.toString();
    
    @property()
    public value: number;
    
    @property()
    public width: number;

    @property({ attribute: 'knob-size' })
    public knobSize: number;

    @property({ attribute: 'start-size' })
    public startSize: number;
    
    @property({ attribute: 'end-size' })
    public endSize: number;
    
    @query('.track')
    private _track: SVGElement;

    @query('.knob')
    private _knob: HTMLDivElement;

    @query('.trackPath')
    private _trackPath: SVGPathElement;

    private get trackBounds() {
        const startRadius = Math.round(this.startSize / 2);
        const endRadius = Math.round(this.endSize / 2);
        const width = this.width - this.knobSize - startRadius - endRadius;

        return new Rectangle(startRadius, 0, width, this.knobSize);
    }

    public render() {
        return `
            <div class="knob"></div>
            <svg class="track">
                <path class="trackPath" />
            </svg>
        `
    }

    public connectedCallback() {
        this.addEventListeners();
    }

    protected override stateHasChanged() {
        this.scale();
    }

    private addEventListeners() {
        this._track.addEventListener('mousedown', e => {
            const { left: trackLeft } = this._track.getBoundingClientRect();
            const { left, right } = this.trackBounds;

            const handleSlide = (e: MouseEvent) => {
                e.preventDefault();

                const x = Math.max(left, Math.min(right, e.clientX - trackLeft));
                
                this.setValue(x);
                this.updateKnob(x);
                this.dispatchEvent(new Event('change'));
            }

            const cleanup = () => {
                document.removeEventListener('mousemove', handleSlide);
                document.removeEventListener('mouseup', cleanup);
            }

            handleSlide(e);

            document.addEventListener('mousemove', handleSlide);
            document.addEventListener('mouseup', cleanup);
        });
    }

    private scale() {
        this.style.width = this.width + 'px';
        this.style.setProperty('--size', this.knobSize + 'px');
        this.style.setProperty('--start-size', this.startSize + 'px');
        
        this._track.setAttribute('viewport', `0 0 ${this.width - 20} 20`);
        this.drawTrack();
    }

    private setValue(x: number) {
        const { left, width } = this.trackBounds;
        const range = this.endSize - this.startSize;
        const value = this.startSize + ((x - left) / width * range);

        this.value = Math.round(value * 10) / 10;
    }

    private updateKnob(left: number) {
        const knobBorder = (this.knobSize - this.value) / 2;

        this._knob.style.left = left + 'px';
        this._knob.style.borderWidth = knobBorder + 'px';
    }

    private drawTrack() {
        const width = this.width - this.knobSize;
        const { startSize, endSize } = this;

        const centerY = this.knobSize / 2;
        const startRadius = Math.round(startSize / 2);
        const endRadius = Math.round(endSize / 2);

        const commands = [
            `M${startRadius},${centerY + startRadius}`,
            `A${startRadius},${startRadius} 0,0,1 ${startRadius},${centerY - startRadius}`,
            `L${width - endRadius},${centerY - endRadius}`,
            `A${endRadius},${endRadius} 0,0,1 ${width - endRadius},${centerY + endRadius}`,
            `Z`
        ]

        this._trackPath.setAttribute('d', commands.join(' '));
    }
}