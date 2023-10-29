import { Point } from '@/classes';
import { StateObservable } from './state-observable';

export class ProjectState extends StateObservable {
    private _rotation: number = 0;
    private _zoom: number = 0;
    private _origin: Point = new Point(0, 0);

    get rotation() {
        return this._rotation;
    }

    set rotation(value: number) {
        this._rotation = value;
        this.stateHasChanged('rotation', value);
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(value: number) {
        this._zoom = value;
        this.stateHasChanged('zoom', value);
    }

    get origin() {
        const handler = {
            set: (_, property, value) => {
                this[property] = value;
                this.stateHasChanged('origin', this._origin);
                return true;
            }
        }

        return new Proxy(this._origin, handler);
    }

    set origin(value: Point) {
        this._origin = value;
        this.stateHasChanged('origin', value);
    }

    stateHasChanged(property: string, value: any) {
      this._observers.forEach(observer => observer.updateState(property, value));
    }
}