import { IStateObservable, StateObserverCallback } from '@/interfaces';

export class StateObservable implements IStateObservable {
    protected _observers: StateObserverCallback[] = [];
    
    subscribe(observer: StateObserverCallback) {
        this._observers.push(observer);
    }

    unsubscribe(observer: StateObserverCallback) {
      const index = this._observers.indexOf(observer);
      
      if (index >= 0) {
        this._observers.splice(index, 1);
      }
    }

    notify(property: string, value: any) {
      this._observers.forEach(observer => observer(property, value));
    }
}