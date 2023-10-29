export interface IStateObserver {
    updateState(property: string, value: any): void;
}