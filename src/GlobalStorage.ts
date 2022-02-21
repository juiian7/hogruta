import { Color } from "./game.js";
import { setLang } from "./language.js";

var lastLevelLoadTime = -1;

export default class GlobalStorage {
    public levels: { [name: string]: LevelStats } = {};
    public currentLevelName: string = null;
    public allCookiesAmount: number = 0;
    public _lang: string = "en";

    constructor() {
        let jsonStr = localStorage.getItem("hogruta");
        if (jsonStr) {
            let json = JSON.parse(window.atob(jsonStr));

            for (const key in json) {
                this[key] = json[key];
            }
        }
        this.currentLevelName = "level18";

        setLang(this._lang);
    }

    public get hasUnlockedTeleporter(): boolean {
        return Number.parseInt(this.currentLevelName.replace("level", "")) > 6 ? true : false;
    }

    public enterLevel(levelName: string) {
        if (lastLevelLoadTime > 0) {
            let diff = Date.now() - lastLevelLoadTime;
            this.levels[this.currentLevelName].duration += diff;
        }
        if (!this.levels[levelName]) {
            this.levels[levelName] = { deathCounter: 0, eatenCookies: [], duration: 0, checkpoints: [] };
        }

        this.currentLevelName = levelName;
        this.saveToLocalStorage();

        lastLevelLoadTime = Date.now();
    }

    public getDuration() {
        let sum = 0;
        for (const key in this.levels) {
            if (key.includes("level")) sum += this.levels[key].duration;
        }
        return sum;
    }

    public getDeaths() {
        let sum = 0;
        for (const key in this.levels) {
            sum += this.levels[key].deathCounter;
        }
        return sum;
    }

    public getPlacedCheckpointAmount() {
        let sum = 0;
        for (const key in this.levels) {
            sum += this.levels[key].checkpoints.length;
        }
        return sum;
    }

    public getEatenCookiesAmount() {
        let sum = 0;
        for (const key in this.levels) {
            sum += this.levels[key].eatenCookies.length;
        }
        return sum;
    }

    public setCheckpoint(x: number, y: number) {
        if (this.levels[this.currentLevelName].checkpoints.find((c) => c.x == x && c.y == y)) return false;

        this.levels[this.currentLevelName].checkpoints.push({ x, y });
        this.saveToLocalStorage();
        return true;
    }

    public removeCheckpoint(x: number, y: number) {
        let i = this.levels[this.currentLevelName].checkpoints.findIndex((c) => c.x == x && c.y == y);
        if (i >= 0) {
            this.levels[this.currentLevelName].checkpoints.splice(i, 1);
            this.saveToLocalStorage();
        }
    }

    public getCheckpoints() {
        return this.levels[this.currentLevelName].checkpoints;
    }

    public playerDied() {
        this.levels[this.currentLevelName].deathCounter++;
    }

    public ateCookie(cookie: { x: number; y: number }) {
        this.levels[this.currentLevelName].eatenCookies.push(cookie);
    }

    public reset() {
        lastLevelLoadTime = -1;
        this.levels = {};
        this.currentLevelName = null;

        window.localStorage.removeItem("hogruta");
    }

    public countCookies(levels: ImageData[]) {
        this.allCookiesAmount = 0;
        for (let l = 0; l < levels.length; l++) {
            for (let c = 0; c < levels[l].data.length; c += 4) {
                if (
                    levels[l].data[c] == Color.brown.r &&
                    levels[l].data[c + 1] == Color.brown.g &&
                    levels[l].data[c + 2] == Color.brown.b
                ) {
                    this.allCookiesAmount++;
                }
            }
        }
    }

    public saveToLocalStorage() {
        console.log("Saving global storage...");
        let json = JSON.stringify(this);
        window.localStorage.setItem("hogruta", window.btoa(json));
    }
}

interface LevelStats {
    duration: number;
    eatenCookies: { x: number; y: number }[];
    deathCounter: number;
    checkpoints: { x: number; y: number }[];
}
