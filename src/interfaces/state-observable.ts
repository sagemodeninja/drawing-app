import { IStateObserver } from '@/interfaces';

export interface IStateObservable {
    addObserver(observer: IStateObserver): void;
    removeObserver(observer: IStateObserver): void;
}