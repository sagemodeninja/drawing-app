import { IStateObservable, IStateObserver } from '@/interfaces';

export class StateObservable implements IStateObservable {
    protected _observers: IStateObserver[] = [];
    
    addObserver(observer: IStateObserver) {
        this._observers.push(observer);
    }

    removeObserver(observer: IStateObserver) {
      const index = this._observers.indexOf(observer);
      
      if (index !== -1)
        this._observers.splice(index, 1);
    }

    stateHasChanged(property: string, value: any) {
      this._observers.forEach(observer => observer.updateState(property, value));
    }
}