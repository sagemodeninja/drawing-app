import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';
import { autoUpdate, computePosition, offset, flip, shift } from '@floating-ui/dom';
import '.';
import { ColorPalette } from './color-palette';
import { ColorSlider } from '.';
import { HSL } from '../../classes';

@customComponent('color-picker')
export class ColorPicker extends CustomComponent {
    static styles = `
        .control {
            background-color: #000;
            border: solid 3px #fff;
            border-radius: 5px;
            box-sizing: border-box;
            cursor: pointer;
            height: 18px;
            width: 18px;
        }

        .picker {
            border-radius: 8px;
            box-shadow: 0px 8px 16px rgb(0 0 0 / 26%);
            box-sizing: border-box;
            display: none;
            overflow: hidden;
            padding: 8px;
            position: fixed;
            z-index: 9999;
            width: 216px;
        }

        .picker::before {
            background-color: #202020CC;
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            backdrop-filter: saturate(180%) blur(20px);
            border: solid 1px rgb(255 255 255 / 8.37%);
            content: '';
            inset: 0;
            position: absolute;
            z-index: -1;
        }

        :host(.picker-shown) .picker {
            display: initial;
        }
    `

    private _color: HSL;

    private _control: HTMLDivElement;
    private _picker: HTMLDivElement;
    private _palette: ColorPalette;
    private _slider: ColorSlider;
    private _hexInput: HTMLInputElement;

    private _pickerCleanup: any;

    // States
    public get color() {
        return this._color;
    }

    public set color(value: HSL) {
        this._color = value;
    }

    // DOM
    private get control() {
        this._control ??= this.shadowRoot.querySelector('.control');
        return this._control;
    }
    
    private get picker() {
        this._picker ??= this.shadowRoot.querySelector('.picker');
        return this._picker;
    }
    
    private get palette() {
        this._palette ??= this.shadowRoot.querySelector('.palette');
        return this._palette;
    }
    
    private get slider() {
        this._slider ??= this.shadowRoot.querySelector('.colorSlider');
        return this._slider;
    }
    
    private get hexInput() {
        this._hexInput ??= this.shadowRoot.querySelector('.hexInput');
        return this._hexInput;
    }

    public render() {
        return `
            <div class="control" part="control"></div>
            <div class="picker" part="picker">
                <color-palette class="palette" part="palette"></color-palette>
                <color-slider class="colorSlider" part="colorSlider"></color-slider>
                <input class="hexInput" />
            </div>
        `
    }

    public connectedCallback() {
        this.addEventListeners();
    }

    private addEventListeners() {
        this.control.addEventListener('click', e => {
            e.stopPropagation();
            this.setPickerShown(true);

            const dismissPicker = e => {
                if (this.contains(e.target)) return;

                this.setPickerShown(false);
                document.removeEventListener('click', dismissPicker)
            }

            document.addEventListener('mousedown', dismissPicker)
        })

        this.palette.addEventListener('change', () => {
            this.updateColor(this.palette.color);
        })

        this.slider.addEventListener('change', () => {
            const color = this.slider.color;

            this.palette.color = color;
            this.updateColor(color);
        })
    }

    private setPickerShown(shown: boolean) {
        this.classList.toggle('picker-shown', shown);
        
        if (shown) {
            this.palette.color = this.color;
            this.slider.color = this.color;

            this._pickerCleanup = autoUpdate(
                this.control,
                this.picker,
                this.updateMenuPosition.bind(this)
            );
        } else if (this._pickerCleanup) {
            this._pickerCleanup();
        }
    }

    private updateMenuPosition() {
        computePosition(this.control, this.picker, {
            placement: 'top',
            middleware: [offset(8), flip(), shift()],
        }).then(({ x, y }) => {
            Object.assign(this.picker.style, {
                left: x + 'px',
                top: y + 'px',
            });
        });
    }

    private updateColor(color: HSL) {
        this._color = color;
        this.hexInput.value = color.toString();
        this.control.style.backgroundColor = color.toString();

        this.dispatchEvent(new Event('change'));
    }
}