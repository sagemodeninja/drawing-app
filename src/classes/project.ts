import { Size } from '@/classes';
import { DrawingCanvas } from '@/components/drawing-canvas';
import { StateObservable } from './state-observable';
import { IBrush } from '@/interfaces';

export class Project extends StateObservable {
    private readonly _layers: DrawingCanvas[] = [];
    
    canvasSize: Size;
    brush: IBrush;

    get layers() {
        return this._layers;
    }

    public addLayer(layer: DrawingCanvas) {
        this._layers.push(layer);
        this.notify('layer', { action: 'add', layer });
    }

    public removeLayer(layer: DrawingCanvas) {
      const index = this._layers.indexOf(layer);
      
      if (index > -1) {
        this._observers.splice(index, 1);
        this.notify('layer', { action: 'remove', layer });
      }
    }
}