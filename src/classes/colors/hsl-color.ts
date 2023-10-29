import { HEX } from './hex-color';
import { RGB } from './rgb-color';

export class HSL {
    hue: number;
    saturation: number;
    lightness: number;

    constructor(hue: number, saturation: number, lightness: number) {
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
    }

    public static fromHex(hex: string) {
        const rgb = HEX.parse(hex);
        return HSL.fromRGB(rgb);
    }

    public static fromRGB({red, green, blue}: RGB) {
        red /= 255;
        green /= 255;
        blue /= 255;

        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const delta = max - min;

        let hue: number = 0;
        let saturation: number = 0;
        let lightness = (max + min) / 2;

        if (delta > 0) {
            saturation = delta / (1 - Math.abs(2 * lightness - 1));

            switch (max) {
                case red:
                    hue = ((green - blue) / delta) % 6;
                    break;
                case green:
                    hue = (blue - red) / delta + 2;
                    break;
                case blue:
                    hue = (red - green) / delta + 4;
                    break;
            }

            hue *= 60;

            if (hue < 0) {
                hue += 360;
            }
        }

        hue = Math.round(hue);
        saturation = Math.round(saturation * 100);
        lightness = Math.round(lightness * 100);

        return new HSL(hue, saturation, lightness);
    }

    public normalize() {
        return new HSL(this.hue, 100, 50);
    }

    public toHex() {
        return HEX.fromHSL(this).toString();
    }

    public toString() {
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }
}