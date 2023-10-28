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
            box-shadow: 0 0 0 3px rgb(255 255 255 / 19%);
            border-radius: 5px;
            box-sizing: content-box;
            cursor: pointer;
            height: 24px;
            width: 24px;
        }

        .picker {
            border-radius: 8px;
            box-shadow: 0px 8px 16px rgb(0 0 0 / 26%);
            box-sizing: border-box;
            display: none;
            flex-direction: column;
            gap: 16px;
            overflow: hidden;
            padding: 12px 0;
            position: fixed;
            z-index: 9999;
            width: 320px;
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
            display: flex;
        }

        .inputs {
            display: flex;
            justify-content: space-evenly;
            padding: 0 12px;
        }

        .inputGroup {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .inputGroup label {
            color: rgb(255 255 255 / 78.6%);
            font-size: 13px;
            font-weight: 500;
        }

        input {
            appearance: none;
            background-color: rgb(255 255 255 / 6.05%);
            border: solid 1px rgb(255 255 255 / 9.3%);
            border-radius: 5px;
            color: #fff;
            font-family: 'Manrope', sans-serif;
            outline: none;
            padding: 8px 12px;
            text-align: center;
            width: 32px;
        }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }

        .hexInput {
            width: 64px;
        }
    `

    private _color: HSL;

    private _control: HTMLDivElement;
    private _picker: HTMLDivElement;
    private _palette: ColorPalette;
    private _slider: ColorSlider;
    private _hexInput: HTMLInputElement;
    private _redChannelInput: HTMLInputElement;
    private _greenChannelInput: HTMLInputElement;
    private _blueChannelInput: HTMLInputElement;

    private _pickerCleanup: any;

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
    
    private get redChannelInput() {
        this._redChannelInput ??= this.shadowRoot.querySelector('.redChannelInput');
        return this._redChannelInput;
    }
    
    private get greenChannelInput() {
        this._greenChannelInput ??= this.shadowRoot.querySelector('.greenChannelInput');
        return this._greenChannelInput;
    }
    
    private get blueChannelInput() {
        this._blueChannelInput ??= this.shadowRoot.querySelector('.blueChannelInput');
        return this._blueChannelInput;
    }

    public render() {
        return `
            <div class="control" part="control"></div>
            <div class="picker" part="picker">
                <color-palette class="palette" part="palette"></color-palette>
                <color-slider class="colorSlider" part="colorSlider"></color-slider>
                <div class="inputs" part="inputs">
                    <div class="inputGroup">
                        <label>Hex</label>
                        <input class="hexInput" />
                    </div>
                    <div class="inputGroup">
                        <label>R</label>
                        <input type="number" class="redChannelInput" />
                    </div>
                    <div class="inputGroup">
                        <label>G</label>
                        <input type="number" class="greenChannelInput" />
                    </div>
                    <div class="inputGroup">
                        <label>B</label>
                        <input type="number" class="blueChannelInput" />
                    </div>
                </div>
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
            this.dispatchEvent(new Event('change'));
        })

        this.slider.addEventListener('change', () => {
            const color = this.slider.color;

            this.palette.color = color;

            this.updateColor(color);
            this.dispatchEvent(new Event('change'));
        })

        const channelInputs = [
            this.redChannelInput,
            this.greenChannelInput,
            this.blueChannelInput,
        ];
        
        channelInputs.map(input => input.addEventListener('input', () => {
            const red = parseInt(this.redChannelInput.value);
            const green = parseInt(this.greenChannelInput.value);
            const blue = parseInt(this.blueChannelInput.value);

            this.color = HSL.fromRGB(red, green, blue);
            this.palette.color = this.color;
            this.slider.color = this.color;
        }));
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
        this.control.style.backgroundColor = color.toString();

        const {red, green, blue} = color.toRGB();
        
        this.hexInput.value = color.toHex().toUpperCase();
        this.redChannelInput.value = red.toString();
        this.greenChannelInput.value = green.toString();
        this.blueChannelInput.value = blue.toString();
    }
}