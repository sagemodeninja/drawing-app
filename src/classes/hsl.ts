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

    public normalize() {
        return new HSL(this.hue, 100, 50);
    }

    public toRGB() {
        let {hue, saturation, lightness} = this;
        
        hue = (hue % 360 + 360) % 360;
        saturation = Math.min(100, Math.max(0, saturation));
        lightness = Math.min(100, Math.max(0, lightness));

        saturation /= 100;
        lightness /= 100;

        const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = lightness - c / 2;

        let red = hue < 120 || hue >= 240 ? (hue > 60 && hue < 300 ? x : c) : 0;
        let green = hue < 240 ? (hue > 60 && hue < 180 ? c : x) : 0;
        let blue = hue > 120 ? (hue >= 180 && hue < 300 ? c : x) : 0;

        red = Math.round((red + m) * 255);
        green = Math.round((green + m) * 255);
        blue = Math.round((blue + m) * 255);

        return { red, green, blue }
    }

    public toHex() {
        const {red, blue, green} = this.toRGB();

        const redHex = red.toString(16).padStart(2, '0');
        const greenHex = green.toString(16).padStart(2, '0');
        const blueHex = blue.toString(16).padStart(2, '0');

        return `#${redHex}${greenHex}${blueHex}`;
    }

    public toString() {
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }
}