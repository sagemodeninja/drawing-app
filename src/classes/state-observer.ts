import { IStateObservable, StateObserverCallback } from '@/interfaces';

export class StateObserver {
    private readonly _targets: IStateObservable[] = [];

    constructor(public callback: StateObserverCallback) {}

    public observe(target: IStateObservable) {
        this._targets.push(target);
        target.subscribe(this.callback);
    }

    public unobserve(target: IStateObservable) {
        const index = this._targets.indexOf(target);

        if (index >= 0) {
            this._targets.splice(index, 1);
            target.unsubscribe(this.callback);
        }
    }

    public disconnect() {
        this._targets.forEach(target => target.unsubscribe(this.callback));
    }
}