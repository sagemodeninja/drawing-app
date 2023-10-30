import { HSL } from './hsl-color';

export class RGB {
    red: number;
    green: number;
    blue: number;
    alpha: number;

    constructor(red: number, green: number, blue: number, alpha?: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha ?? 1;
    }

    public static fromHSL({hue, saturation, lightness}: HSL) {
        hue = (hue % 360 + 360) % 360;
        saturation = Math.min(100, Math.max(0, saturation));
        lightness = Math.min(100, Math.max(0, lightness));

        saturation /= 100;
        lightness /= 100;

        const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const large = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness - chroma / 2;

        let red = hue < 120 || hue >= 240 ? (hue >= 60 && hue < 300 ? large : chroma) : 0;
        let green = hue < 240 ? (hue >= 60 && hue < 180 ? chroma : large) : 0;
        let blue = hue > 120 ? (hue >= 180 && hue < 300 ? chroma : large) : 0;

        red = Math.round((red + m) * 255);
        green = Math.round((green + m) * 255);
        blue = Math.round((blue + m) * 255);

        return new this(red, green, blue);
    }
}