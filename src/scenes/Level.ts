import { apate, Color, levelLoader, Scene, transition } from "../game.js";
import Snowflakes from "../scripts/background/Snowflakes.js";
import Player from "../scripts/Player.js";
import { Tile } from "../scripts/Tilemap.js";
import CameraFollow from "../scripts/CameraFollow.js";
import Door from "../scripts/Door.js";
import { LevelData, LevelMetaData } from "../LevelLoader.js";

export default class Level extends Scene {
    public readonly data: LevelData;
    public readonly meta: LevelMetaData;

    constructor(lvlData: LevelData) {
        super(transition, apate);

        if (lvlData) {
            this.data = lvlData;
            this.meta = lvlData.meta;
        }

        apate.input.clearRegisteredButtons();
    }

    onLoad() {
        apate.random.seed = 42;
        if (this.data) this.applyLevelData(this.data);
    }

    applyLevelData(lvlData: LevelData) {
        this.apateInstance.camera(-lvlData.cameraArea.x, -lvlData.cameraArea.y);

        let snowflakes: Snowflakes = null;

        if (lvlData.isSnowing) {
            snowflakes = new Snowflakes(lvlData.tilemap.maxX * 8);
            this.add(snowflakes);
        }

        if (lvlData.isIceCave) apate.clearColor = Color.gray;
        else apate.clearColor = Color.black;

        if (lvlData.cameraFollow) this.add(new CameraFollow(lvlData.player, lvlData.cameraArea));

        transition.focus.x = lvlData.player.x;
        transition.focus.y = lvlData.player.y;

        if (lvlData.player) {
            lvlData.player.forceX = lvlData.forceField.x;
            lvlData.player.forceY = lvlData.forceField.y;

            if (lvlData.isSnowing && lvlData.forceField.x + lvlData.forceField.y != 0)
                snowflakes.setVelocity(lvlData.forceField.x, lvlData.forceField.y);
        }

        if (apate.showInfo) {
            this.add(lvlData.tilemap);
            this.add(lvlData.player);
        } else {
            this.add(lvlData.player);
            this.add(lvlData.tilemap);
        }
        if (lvlData.door) this.add(new Door(lvlData.door, lvlData.keys, lvlData.player, lvlData.tilemap));
    }

    changeScene(tile: Tile, player: Player) {
        levelLoader.loadNext();
    }
}
