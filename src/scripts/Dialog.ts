import { Entity, Color, DrawLib, apate } from "../game.js";

type TextAlign = "left" | "center" | "right";

export default class Dialog extends Entity {
    private _lines: string[];
    private _fg: Color;
    private _bg?: Color;
    private posY: number;
    private posX: number;
    private margin: number;
    private align: TextAlign;
    private cps: number;
    private scale: number;

    private charProgress: number = 0;
    private nextChar: number;

    private longestLineLen: number;
    private lineSpacing = 4;

    public hasFinished = false;
    private maxProgress: number;

    constructor(
        msg: string,
        foreground: Color,
        posY: number,
        charsPerSecound: number = 10,
        margin: number = 4,
        background?: Color | null,
        align: TextAlign = "left",
        scale: number = 1
    ) {
        super();

        this._lines = msg.split("\n");
        this._fg = foreground;
        this._bg = background;

        this.margin = margin;
        this.align = align;
        this.cps = charsPerSecound;
        this.scale = scale;

        this.nextChar = 1000 / this.cps;

        let ll = "";
        for (let i = 0; i < this._lines.length; i++) {
            if (this._lines[i].length > ll.length) ll = this._lines[i];
        }
        this.longestLineLen = apate.draw.measureText(ll);

        this.maxProgress = this._lines.join("").length;

        this.posY = posY;
        this.posX = 64 + apate.screenOffset.x - this.longestLineLen / 2 - this.margin;
    }

    public update(delta: number): void {
        this.nextChar -= delta;
        if (this.nextChar < 0) {
            this.charProgress++;
            this.nextChar = 1000 / this.cps;

            if (this.charProgress >= this.maxProgress && !this.hasFinished) this.hasFinished = true;
        }
    }
    draw(draw: DrawLib) {
        let charCounter = this.charProgress;

        if (this._bg) {
            draw.rect(
                this.posX,
                this.posY,
                this.longestLineLen + this.margin * 2,
                this._lines.length * (5 + this.lineSpacing) + this.margin * 2 + 1,
                this._bg
            );
        }

        for (let i = 0; i < this._lines.length; i++) {
            let msg = charCounter <= this._lines[i].length ? this._lines[i].substring(0, charCounter) : this._lines[i];
            charCounter -= msg.length;
            //let width = draw.measureText(msg);

            let xPos = this.posX + this.margin;

            if (this.align == "center") xPos = Math.round(64 - draw.measureText(msg) / 2 + apate.screenOffset.x);
            draw.text(xPos, this.posY + 1 + this.margin + i * (5 + this.lineSpacing), msg, this._fg, this.scale);
        }
    }
}
