export interface StateObserverCallback {
    (property: string, state: any): void;   
}

export interface IStateObservable {
    subscribe(callback: StateObserverCallback): void;
    unsubscribe(callback: StateObserverCallback): void;
}