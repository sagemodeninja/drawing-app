import '@/components';
import styles from '@/styles/color-picker.module.scss';

import { HSL } from '@/classes';
import { ColorPalette, ColorSlider, ToolPopup } from '@/components';
import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';
import { RGB } from '@/classes/colors';

const classNames: Record<string, string> = styles.locals;

@customComponent('color-picker')
export class ColorPicker extends CustomComponent {
    static styles = styles.toString();

    private _color: HSL = new HSL(0, 0, 0);

    private _control: HTMLDivElement;
    private _picker: ToolPopup;
    private _palette: ColorPalette;
    private _slider: ColorSlider;
    private _hexInput: HTMLInputElement;
    private _redChannelInput: HTMLInputElement;
    private _greenChannelInput: HTMLInputElement;
    private _blueChannelInput: HTMLInputElement;

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
            <div class="control ${classNames.control}" part="control"></div>
            <tool-popup class="picker ${classNames.picker}" part="picker">
                <div class="pointer ${classNames.pointer}" part="pointer"></div>
                <color-palette class="palette" part="palette"></color-palette>
                <color-slider class="colorSlider" part="colorSlider"></color-slider>
                <div class="inputs ${classNames.inputs}" part="inputs">
                    <div class="inputGroup ${classNames.inputGroup}">
                        <label>Hex</label>
                        <input class="hexInput ${classNames.hexInput}" />
                    </div>
                    <div class="inputGroup ${classNames.inputGroup}">
                        <label>R</label>
                        <input type="number" class="redChannelInput" />
                    </div>
                    <div class="inputGroup ${classNames.inputGroup}">
                        <label>G</label>
                        <input type="number" class="greenChannelInput" />
                    </div>
                    <div class="inputGroup ${classNames.inputGroup}">
                        <label>B</label>
                        <input type="number" class="blueChannelInput" />
                    </div>
                </div>
            </tool-popup>
        `
    }

    public connectedCallback() {
        this.picker.attach(this.control, 'top');
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

            this.updateColor(HSL.fromRGB(new RGB(red, green, blue)));

            this.palette.color = this.color;
            this.slider.color = this.color;
        }));
    }

    private setPickerShown(shown: boolean) {
        if (shown) {
            this.palette.color = this._color;
            this.slider.color = this._color;
    
            this.picker.show();
        } else {
            this.picker.hide();
        }
    }

    private updateColor(color: HSL) {
        this._color = color;
        this.control.style.backgroundColor = color.toString();

        const {red, green, blue} = RGB.fromHSL(color);
        
        this.hexInput.value = color.toHex().toUpperCase();
        this.redChannelInput.value = red.toString();
        this.greenChannelInput.value = green.toString();
        this.blueChannelInput.value = blue.toString();
    }
}