import { Color, spritelib } from "./game.js";
import { levelMetaDatas } from "./LevelLoader.js";

export default class SpriteLoader {
    private spriteMap: { [name: string]: ImageData } = {};
    private animationMap: { [name: string]: ImageData[] } = {};
    private convertCanvas: HTMLCanvasElement;

    constructor() {
        this.convertCanvas = document.createElement("canvas");
    }

    async load() {
        const tiles = await spritelib.load("res/tiles.png");
        const characters = await spritelib.load("res/characters.png");

        let lines = [];
        for (let i = 0; i < 8; i++) {
            lines.push(spritelib.split(tiles, 8, 8, i * 8));
        }

        let character = [];
        for (let i = 0; i < 8; i++) {
            character.push(spritelib.split(characters, 8, 8, i * 8));
        }

        this.spriteMap = {
            block: lines[0][0],
            cookie: lines[0][1],
            spike: lines[0][2],
            spike_down: spritelib.filp(lines[0][2], false, true),
            spike_left: lines[0][3],
            spike_right: spritelib.filp(lines[0][3], true),
            grass1: lines[0][4],
            grass2: lines[0][5],
            grass_block: lines[0][6],

            snow_stone_block: lines[0][0],
            snow_stone_top_left: lines[1][0],
            snow_stone_top_mid: lines[1][1],
            snow_stone_top_right: lines[1][2],

            snow_stone_mid_left: lines[2][0],
            snow_stone_mid_left_blank: lines[3][0],
            snow_stone_mid_mid: lines[2][1],
            snow_stone_mid_mid_blank: lines[3][1],
            snow_stone_mid_right: lines[2][2],
            snow_stone_mid_right_blank: lines[3][2],

            snow_stone_bottom_left: lines[4][0],
            snow_stone_bottom_mid: lines[4][1],
            snow_stone_bottom_right: lines[4][2],

            ice_ground_top_left: lines[1][3],
            ice_ground_top_mid: lines[1][4],
            ice_ground_top_right: lines[1][5],

            ice_ground_mid_left: lines[2][3],
            ice_ground_mid_left_blank: lines[3][3],
            ice_ground_mid_mid: lines[2][4],
            ice_ground_mid_mid_blank: lines[3][4],
            ice_ground_mid_right: lines[2][5],
            ice_ground_mid_right_blank: lines[3][5],

            ice_ground_bottom_left: lines[4][3],
            ice_ground_bottom_mid: lines[4][4],
            ice_ground_bottom_right: lines[4][5],

            crystal_top: lines[1][6],
            crystal_bottom: lines[2][6],

            campfire_left: lines[4][6],
            campfire_right: lines[4][7],

            player_main_right: character[0][0],
            player_main_left: spritelib.filp(character[1][0], true, false),

            player_falling: character[3][2],

            stranger: spritelib.filp(character[3][1], true, false),
            checkpoint: lines[0][7],
            key: lines[3][6],

            inner_door_bottom: lines[0][8],
            outer_door_bottom: lines[1][8],
            inner_door_top: spritelib.filp(lines[0][8], true, true),
            outer_door_top: spritelib.filp(lines[1][8], true, true),

            finish: character[1][0],
        };

        let doors = ["inner_door_bottom", "outer_door_bottom", "inner_door_top", "outer_door_top"];
        for (const door of doors) {
            this.spriteMap[door + "_red"] = spritelib.createCopy(this.spriteMap[door]);
            spritelib.replaceColor(this.spriteMap[door + "_red"], Color.agua, Color.dark_red);
            spritelib.replaceColor(this.spriteMap[door + "_red"], Color.light_gray, Color.red);
            spritelib.replaceColor(this.spriteMap[door + "_red"], Color.gray, Color.gray);
        }

        this.animationMap = {
            player_walk_right: character[0],
            player_walk_left: character[0].map((frame) => spritelib.filp(frame, true)),

            player_jump_right: character[1],
            player_jump_left: [spritelib.filp(character[1][0], true)],

            player_fall_right: character[2],
            player_fall_left: [spritelib.filp(character[2][0], true)],

            raven: [character[1][1], character[1][2], character[1][3], character[1][2]],

            fire: [lines[1][7], lines[2][7], lines[3][7]],
        };
    }

    async loadLevelSprites() {
        let names = levelMetaDatas.filter((m) => m.spriteName).map((meta) => meta.spriteName);
        names = [...new Set(names)];

        let levelPromises = [];
        for (const name of names) {
            levelPromises.push(spritelib.load(`res/levels/${name}.png`));
        }
        const levels = await Promise.all(levelPromises);

        for (let l = 0; l < levels.length; l++) {
            this.spriteMap[names[l]] = levels[l];
        }

        return levels;
    }

    getSprite(name: string): ImageData {
        return this.spriteMap[name] ?? null;
    }

    getAnimatedSprite(name: string, frame: number): ImageData {
        return this.animationMap[name][frame] ?? null;
    }

    getSpriteNames() {
        return Object.keys(this.spriteMap);
    }

    toDataUrl(sprite: ImageData) {
        this.convertCanvas.width = sprite.width;
        this.convertCanvas.height = sprite.height;
        this.convertCanvas.getContext("2d").putImageData(sprite, 0, 0);
        return this.convertCanvas.toDataURL();
    }
}
