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
        hex = hex.replace('#', '');

        const red = parseInt(hex.slice(0, 2), 16) / 255;
        const green = parseInt(hex.slice(2, 4), 16) / 255;
        const blue = parseInt(hex.slice(4, 6), 16) / 255;

        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);

        let hue: number = 0;
        let saturation: number = 0;
        let lightness = (max - min) / 2;

        if (max != min) {
            // Calculate the saturation (S)
            saturation = lightness > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

            // Calculate the hue (H)
            if (max === red) {
                hue = (green - blue) / (max - min);
            } else if (max === green) {
                hue = 2 + (blue - red) / (max - min);
            } else {
                hue = 4 + (red - green) / (max - min);
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

    public static fromRGB(red: number, green: number, blue: number) {
        red /= 255;
        green /= 255;
        blue /= 255;

        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);

        let hue: number = 0;
        let saturation: number = 0;
        let lightness = (max + min) / 2;

        if (max !== min) {
            const delta = max - min;

            saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
                case red:
                    hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
                    break;
                case green:
                    hue = ((blue - red) / delta + 2) * 60;
                    break;
                case blue:
                    hue = ((red - green) / delta + 4) * 60;
                    break;
            }
        }

        hue = Math.round(hue);
        saturation = Math.round(saturation * 100);
        lightness = Math.round(lightness * 100);

        return new HSL(hue, saturation, lightness);
    }

    public toHex() {
        // // Ensure h is in the range [0, 360), and s and l are in the range [0, 100]
        // h = (h % 360 + 360) % 360;
        // s = Math.min(100, Math.max(0, s));
        // l = Math.min(100, Math.max(0, l));

        // // Convert HSL to RGB
        // s /= 100;
        // l /= 100;
        // const c = (1 - Math.abs(2 * l - 1)) * s;
        // const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        // const m = l - c / 2;

        // let r, g, b;
        // if (h < 60) {
        //     r = c;
        //     g = x;
        //     b = 0;
        // } else if (h < 120) {
        //     r = x;
        //     g = c;
        //     b = 0;
        // } else if (h < 180) {
        //     r = 0;
        //     g = c;
        //     b = x;
        // } else if (h < 240) {
        //     r = 0;
        //     g = x;
        //     b = c;
        // } else if (h < 300) {
        //     r = x;
        //     g = 0;
        //     b = c;
        // } else {
        //     r = c;
        //     g = 0;
        //     b = x;
        // }

        // // Convert RGB to HEX
        // r = Math.round((r + m) * 255);
        // g = Math.round((g + m) * 255);
        // b = Math.round((b + m) * 255);

        // // Convert the RGB values to HEX format
        // const redHex = r.toString(16).padStart(2, '0');
        // const greenHex = g.toString(16).padStart(2, '0');
        // const blueHex = b.toString(16).padStart(2, '0');

        // return `#${redHex}${greenHex}${blueHex}`;
    }

    public normalize() {
        return new HSL(this.hue, 100, 50);
    }

    public toString() {
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }
}