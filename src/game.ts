import { Apate, Color, Button } from "../engine/src/apate.js";

import Transition from "./scripts/LevelTransition.js";
import SpriteLoader from "./SpriteLoader.js";
import LevelLoader from "./LevelLoader.js";
import GlobalStorage from "./GlobalStorage.js";
import { pause } from "./scenes/Level.js";

export const transition = new Transition();
export const apate = new Apate();

apate.drawCursor = false;
apate.autoScale = true;
apate.clearColor = Color.black;
apate.showInfo = false;

apate.random.seed = 42;

document.querySelector("#main").append(apate.htmlElement);

apate.input.addButton(new Button("checkpoint", ["KeyE"], 3));
apate.input.addButton(new Button("restart", ["KeyP"], 4));

export function restart() {
    globalStorage.reset();
    levelLoader.currentLevel = null;
    levelLoader.loadNext();
    apate.input.clearRegisteredButtons();

    pause.isPaused = false;
}

export const spriteLoader = new SpriteLoader();
export const levelLoader = new LevelLoader();

export var globalStorage = new GlobalStorage();

export { Entity, Scene, Color, Transition, ParticleSystem, Button, colorlib, Random, spritelib } from "../engine/src/apate.js";

export { DrawLib } from "../engine/src/utils/drawlib.js";
