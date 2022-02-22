import { apate, Color, DrawLib, Entity, levelLoader, transition } from "../game.js";
import Dialog from "../scripts/Dialog.js";
import Level from "./Level.js";

export default class Credits extends Level {
    private pages: { lines: { text: string; scale: number; color: Color; y: number }[]; duration: number }[] = [];
    private currentPage = -1;
    private nextPage: number = 0;

    private isDone = false;

    onLoad(): void {
        apate.camera(0, 0);

        this.pages.push({ duration: 3000, lines: [{ text: "Hogruta", y: 48, scale: 3, color: Color.white }] });
        this.pages.push({
            duration: 5000,
            lines: [
                { text: "A game by", y: 48, scale: 2, color: Color.white },
                { text: "ZupaJul", y: 64, scale: 3, color: Color.white },
            ],
        });
        this.pages.push({
            duration: 5000,
            lines: [
                { text: "Music by", y: 30, scale: 2, color: Color.white },
                { text: "HaQmi", y: 48, scale: 3, color: Color.white },
                { text: "and", y: 68, scale: 1, color: Color.white },
                { text: "Rex", y: 78, scale: 3, color: Color.white },
            ],
        });
        this.pages.push({
            duration: 5000,
            lines: [
                { text: "Special thanks to", y: 30, scale: 1, color: Color.white },
                { text: "2steve2", y: 44, scale: 2, color: Color.white },
                { text: "GreyWolf", y: 62, scale: 2, color: Color.white },
                { text: "FischoHD", y: 80, scale: 2, color: Color.white },
                { text: "And all other Testers", y: 108, scale: 1, color: Color.white },
            ],
        });
    }

    draw(draw: DrawLib): void {
        if (!this.pages[this.currentPage]) return;

        for (const l of this.pages[this.currentPage].lines) {
            const w = draw.measureText(l.text, l.scale);
            draw.text(Math.round(64 - w / 2), l.y, l.text, l.color, l.scale);
        }
    }

    update(delta: number): void {
        if (this.isDone) return;

        this.nextPage -= delta;
        if (this.nextPage < 0) {
            this.currentPage++;
            if (this.currentPage >= this.pages.length) {
                levelLoader.loadNext();
                this.isDone = true;
                return;
            }

            this.nextPage = this.pages[this.currentPage].duration;
        }
    }
}
