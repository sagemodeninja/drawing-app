/**
 * Stores indexes in range pair.
 */
export class RangeArray {
    constructor() {
        this._store = [];
    }

    public get length() {
        return this._store.length / 2;
    }

    private _store: number[];

    public push(index: number) {

    }

    public has(index: number) {
        for (let i = 0; i < this.length; i++) {
            const start = i * 2;
            const end = start + 1;

            const s = this._store[start];
            const e = this._store[end];

            if (s <= index && index <= e)
                return true;
        }

        return false;
    }

    public unbox() {
        
    }
}