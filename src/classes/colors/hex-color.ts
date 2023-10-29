import { RGB } from './rgb-color';

const validFormat = /^([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/;

export class HEX extends RGB {
    public static parse(hex: string) {
        hex = HEX.standardize(hex);

        const red = parseInt(hex.slice(0, 2), 16);
        const green = parseInt(hex.slice(2, 4), 16);
        const blue = parseInt(hex.slice(4, 6), 16);
        const alpha = parseInt(hex.slice(6, 8), 16) / 255;

        return new HEX(red, green, blue, alpha);
    }

    public static standardize(hex: string) {
        hex = hex.replace('#', '').toUpperCase();

        if (!validFormat.test(hex))
            throw 'Invalid hexadecimal color code. https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color';

        if (hex.length <= 4) {
            hex = hex
                    .split('')
                    .map((char, index) => index === 3 ? char : char + char)
                    .join('');
        }

        return hex.padEnd(8, 'FF');
    }

    public toString() {
        const { red, green, blue } = this;
        const toHex = value => value.toString(16).padStart(2, '0');

        return '#' + [red, green, blue].map(toHex).join('');
    }
}