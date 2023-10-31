import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';
import { ToolPopup } from '@/components';
import styles from '@/styles/brush-tool.module.scss';

const classes: Record<string, string> = styles.locals;

@customComponent('brush-tool')
export class BrushTool extends CustomComponent {
    static styles = styles.toString();

    private _control: HTMLButtonElement;
    private _popup: ToolPopup;

    // DOM
    private get control() {
        this._control ??= this.shadowRoot.querySelector('.' + classes.control);
        return this._control;
    }
    
    private get popup() {
        this._popup ??= this.shadowRoot.querySelector('.popup');
        return this._popup;
    }

    public render() {
        return `
            <button class="${classes.control}" part="control">
                <svg class="${classes.icon}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M175.2 288.9c-24.31 2.156-46.98 12.2-64.38 29.7c-22.4 22.51-32.32 52.9-29.74 82.38c2.254 25.82-16.99 46.1-49.03 46.1C14.34 448 0 462.3 0 480C0 497.7 14.34 512 32.04 512h53.78c54.59 0 133.2-7.568 172.3-46.92c23.67-23.82 32.49-56.36 28.19-87.39L175.2 288.9zM499.5 17.46c-8.979-10.28-21.4-16.44-35.01-17.33c-13.55-1-26.72 3.578-36.92 12.59L222.3 193.7C215.8 199.4 210.1 206.2 205.7 213.1c-9.459 14.95-13.76 31.67-13.78 48.2l110.3 88.18c23.03-5.436 42.71-19.34 55.41-39.44l146.4-231.6C516.2 59.49 514.2 34.4 499.5 17.46z" />
                </svg>
            </button>
            <tool-popup class="popup" part="popup">
                <brush-size-slider></brush-size-slider>
            </tool-popup>
        `;
    }

    public connectedCallback() {
        this.popup.attach(this.control, 'top');
        this.addEventListeners();
    }

    private addEventListeners() {
        this.control.addEventListener('click', e => {
            e.stopPropagation();
            this.setActive(true);

            const dismiss = e => {
                if (this.contains(e.target)) return;

                this.setActive(false);
                document.removeEventListener('click', dismiss)
            }

            document.addEventListener('mousedown', dismiss)
        })
    }

    private setActive(active: boolean) {
        if (active) {
            this.popup.show();
        } else {
            this.popup.hide();
        }
    }
}