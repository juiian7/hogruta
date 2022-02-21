import { apate, Color, colorlib, globalStorage, spriteLoader } from "./game.js";
import initLevels from "./scenes/index.js";
import Level from "./scenes/Level.js";
import Start from "./scenes/Start.js";
import Player from "./scripts/Player.js";
import Tilemap from "./scripts/Tilemap.js";

export interface LevelMetaData {
    name: string;
    instanceOf?: new (...params: any[]) => Level;
    spriteName?: string;
    previous?: LevelMetaData;
    next: (level: Level) => LevelMetaData;
    manipulateData?: (data: LevelData) => void;
}

export interface LevelData {
    tilemap: Tilemap;
    playerPos?: { x: number; y: number };
    player?: Player;
    isSnowing: boolean;
    isIceCave: boolean;
    cookies: { x: number; y: number }[];
    cameraFollow: boolean;
    cameraArea: { x: number; y: number; w: number; h: number };
    meta: LevelMetaData;
    keys: { x: number; y: number }[];
    door?: { x: number; y: number };
    forceField: { x: number; y: number };
}

export default class LevelLoader {
    currentLevel: Level;
    lastLevel: Level;

    constructor() {}

    async load(meta: LevelMetaData) {
        console.info("Loading: " + meta.name + "...");

        this.lastLevel = this.currentLevel;

        globalStorage.enterLevel(meta.name);

        let data: LevelData = { meta } as LevelData;
        if (meta.spriteName) {
            let levelSprite = spriteLoader.getSprite(meta.spriteName);

            if (!levelSprite) {
                console.error("Level sprite: " + meta.spriteName + " sprite not found!");
                return;
            }

            data = spriteToLevelData(levelSprite, meta);

            if (meta.manipulateData) meta.manipulateData(data);
        }

        if (meta.instanceOf) this.currentLevel = new meta.instanceOf(data);
        else this.currentLevel = new Level(data);

        this.cleanEatenCookies(data);

        await this.currentLevel.load();
    }

    private cleanEatenCookies(lvlData: LevelData) {
        // clean eaten cookies
        let eatenCookies = globalStorage.levels[globalStorage.currentLevelName].eatenCookies;
        for (let i = 0; i < eatenCookies.length; i++) {
            let c = lvlData.cookies.findIndex((c) => c.x == eatenCookies[i].x && c.y == eatenCookies[i].y);
            if (c > -1) {
                let removed = lvlData.cookies.splice(c, 1)[0];
                lvlData.tilemap.tile(removed.x / 8, removed.y / 8, "");
            }
        }
    }

    async loadNext() {
        if (!this.currentLevel) {
            if (!globalStorage.currentLevelName) await new Start().load();
            else await this.load(getLevelMetaData(globalStorage.currentLevelName));
        } else await this.load(this.currentLevel.meta.next(this.currentLevel));
    }
    async loadPrevious() {
        if (this.currentLevel.meta.previous) this.load(this.currentLevel.meta.previous);
    }
    async restart() {
        this.load(this.currentLevel.meta);
    }
}

export const levelMetaDatas: LevelMetaData[] = [];
initLevels(levelMetaDatas);

export function getLevelMetaData(name: string) {
    let meta = levelMetaDatas.find((m) => m.name == name);
    if (!meta) console.error("No level meta data with found: " + name);
    return meta;
}

export function spriteToLevelData(sprite: ImageData, lvlMetaData: LevelMetaData): LevelData {
    let tm = new Tilemap(8, 8);

    let levelData: LevelData = {
        tilemap: tm,
        isSnowing: false,
        isIceCave: false,
        cookies: [],
        cameraFollow: true,
        cameraArea: { x: 0, y: 0, w: 128, h: 128 },
        meta: lvlMetaData,
        keys: [],
        door: null,
        forceField: { x: 0, y: 0 },
    };

    if (lvlMetaData.name == "level17") levelData.forceField = { x: -2, y: -0.15 };
    if (lvlMetaData.name == "level17s") levelData.forceField = { x: 0, y: -0.75 };
    if (lvlMetaData.name == "level18") levelData.forceField = { x: 3, y: -0.1 };

    let camPoints: { x: number; y: number }[] = [];
    let blocks: { x: number; y: number; mesh: boolean; type: string }[] = [];
    let spikes: { x: number; y: number }[] = [];

    for (let x = 0; x < sprite.width; x++) {
        for (let y = 0; y < sprite.height; y++) {
            let i = (y * sprite.width + x) * 4;
            let color = new Color(sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]);

            if (colorlib.isSame(color, Color.red)) spikes.push({ x, y });
            else if (colorlib.isSame(color, Color.pink) && i == 0) levelData.isSnowing = true;
            else if (colorlib.isSame(color, Color.magenta) && i == 0) levelData.isIceCave = true;
            else if (colorlib.isSame(color, Color.black)) blocks.push({ x, y, mesh: true, type: "snow_stone" });
            else if (colorlib.isSame(color, Color.gray)) blocks.push({ x, y, mesh: false, type: "snow_stone" });
            else if (colorlib.isSame(color, Color.agua)) blocks.push({ x, y, mesh: true, type: "ice_ground" });
            else if (colorlib.isSame(color, Color.dark_agua)) blocks.push({ x, y, mesh: false, type: "ice_ground" });
            else if (colorlib.isSame(color, Color.yellow)) tm.tile(x, y, "finish", true, true);
            else if (colorlib.isSame(color, Color.ocher)) tm.tile(x, y, "previous", true, true);
            else if (colorlib.isSame(color, Color.jade)) tm.tile(x, y, "grass1");
            else if (colorlib.isSame(color, Color.avocado)) tm.tile(x, y, "grass_block", false);
            else if (colorlib.isSame(color, Color.mint)) tm.tile(x, y, "grass2");
            else if (colorlib.isSame(color, Color.light_purple)) levelData.playerPos = { x: x * 8, y: y * 8 };
            else if (colorlib.isSame(color, Color.white)) camPoints.push({ x, y });
            else if (colorlib.isSame(color, Color.brown)) tm.tile(x, y, "cookie"), levelData.cookies.push({ x: x * 8, y: y * 8 });
            else if (colorlib.isSame(color, Color.cyan)) levelData.keys.push({ x, y });
            else if (colorlib.isSame(color, Color.orange) && !levelData.door) levelData.door = { x, y };
        }
    }

    if (camPoints.length >= 2) {
        levelData.cameraArea.x = (camPoints[0].x + 1) * 8;
        levelData.cameraArea.y = (camPoints[0].y + 1) * 8;

        levelData.cameraArea.w = (camPoints[1].x - (camPoints[0].x + 1)) * 8;
        levelData.cameraArea.h = (camPoints[1].y - (camPoints[0].y + 1)) * 8;
    }

    // auto tile blocks
    for (let i = 0; i < blocks.length; i++) {
        let name = "block";
        let sblocks = getSurroundingBlocks(blocks[i].x, blocks[i].y, blocks);

        if (!sblocks[0][1] && !sblocks[1][0] && !sblocks[1][2] && !sblocks[2][1]) {
        } else if (sblocks[0][1] && sblocks[1][0] && sblocks[1][2] && sblocks[2][1]) {
            name = "mid_mid";
            if (apate.random.betweenInt(0, 2) == 1) name = "mid_mid_blank";
        } else if (!sblocks[0][1]) {
            name = "top_mid";
            if (!sblocks[1][2]) name = "top_right";
            else if (!sblocks[1][0]) name = "top_left";
        } else if (!sblocks[2][1]) {
            name = "bottom_mid";
            if (!sblocks[1][2]) name = "bottom_right";
            else if (!sblocks[1][0]) name = "bottom_left";
        } else {
            if (!sblocks[1][0]) name = "mid_left";
            else if (!sblocks[1][2]) name = "mid_right";
            if (apate.random.next() > 0.3) name += "_blank";
        }

        tm.tile(blocks[i].x, blocks[i].y, blocks[i].type + "_" + name, blocks[i].mesh);
    }
    //auto tile spikes
    for (let i = 0; i < spikes.length; i++) {
        let sblocks = getSurroundingBlocks(spikes[i].x, spikes[i].y, blocks);
        let type = "spike";
        if (sblocks[2][1]) {
        } else if (sblocks[0][1]) type += "_down";
        else if (sblocks[1][0]) type += "_right";
        else if (sblocks[1][2]) type += "_left";

        tm.tile(spikes[i].x, spikes[i].y, type, true, false);
    }

    if (levelData.playerPos) levelData.player = new Player(levelData.playerPos.x, levelData.playerPos.y, levelData);

    return levelData;
}

function getSurroundingBlocks(x: number, y: number, blocks: any[]) {
    let sblocks = [];
    for (let dy = 0; dy < 3; dy++) {
        let row = [];
        for (let dx = 0; dx < 3; dx++) {
            let b = blocks.find((b) => dx - 1 + x == b.x && dy - 1 + y == b.y);
            if (b) row.push(true);
            else row.push(false);
        }
        sblocks.push(row);
    }
    return sblocks;
}
