import 'reflect-metadata';

export const STATE_PROPERTIES_KEY = Symbol('state_properties');

export function state() {
    return function(target: any, key: string) {
        const privateKey = `_${key}`;

        // Get the class prototype and store the property key in metadata
        const classPrototype = target.constructor.prototype;
        const stateProperties = Reflect.getMetadata(STATE_PROPERTIES_KEY, classPrototype) || [];
        
        stateProperties.push(key);
        Reflect.defineMetadata(STATE_PROPERTIES_KEY, stateProperties, classPrototype);

        // Getters and setters
        const get = function () {
            return this[privateKey];
        }
    
        const set = function (newValue: any) {
            const oldValue = this[privateKey];

            this[privateKey] = newValue;
    
            if (this.onStateChanged) {
                this.onStateChanged(key, oldValue, newValue);
            }
        }
        
        // Push the property name onto observedAttributes
        if (!target.observedAttributes) {
            target.observedAttributes = [];
        }
        target.observedAttributes.push(key);

        // Public property
        Object.defineProperty(target, key, {
            get,
            set,
            enumerable: true,
            configurable: true,
        });
    }
}