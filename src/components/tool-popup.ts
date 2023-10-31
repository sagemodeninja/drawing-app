import { CustomComponent, customComponent } from '@sagemodeninja/custom-component';
import {
    autoUpdate,
    computePosition,
    offset,
    flip,
    shift,
    Placement
} from '@floating-ui/dom';
import styles from '@/styles/tool-popup.component.scss';

@customComponent('tool-popup')
export class ToolPopup extends CustomComponent {
    static styles = styles.toString();

    private _anchor: any;
    private _placement: Placement;
    private _cleanup: () => void;

    public render() {
        return `<slot></slot>`;
    }

    public attach(anchor: any, placement: Placement) { 
        this._anchor = anchor;
        this._placement = placement;
    }

    public show() {
        this.classList.toggle('active', true);

        this._cleanup = autoUpdate(
            this._anchor,
            this,
            this.updatePosition.bind(this)
        );
    }

    public hide() {
        this._cleanup();
        this.classList.toggle('active', false);
    }

    private updatePosition() {
        computePosition(this._anchor, this, {
            placement: this._placement,
            middleware: [offset(16), flip(), shift()],
        }).then(({ x, y }) => {
            Object.assign(this.style, {
                left: x + 'px',
                top: y + 'px',
            });
        });
    }
}