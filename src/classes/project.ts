import { Size } from '@/classes';
import { CanvasLayer } from '@/classes/canvas-layer';
import { StateObservable } from './state-observable';
import { IBrush } from '@/interfaces';

export class Project extends StateObservable {
    private readonly _layers: CanvasLayer[] = [];
    
    public canvasSize: Size;
    public brush: IBrush;

    get layers() {
        return this._layers;
    }

    public addLayer(layer: CanvasLayer) {
        this._layers.push(layer);
        this.notify('layer', { action: 'add', layer });
    }

    public removeLayer(layer: CanvasLayer) {
      const index = this._layers.indexOf(layer);
      
      if (index > -1) {
        this._observers.splice(index, 1);
        this.notify('layer', { action: 'remove', layer });
      }
    }
}