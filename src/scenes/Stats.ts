import { apate, Color, Entity, globalStorage, levelLoader, transition } from "../game.js";
import { getDict } from "../language.js";
import { LevelMetaData } from "../LevelLoader.js";
import Dialog from "../scripts/Dialog.js";
import Level from "./Level.js";

export default class Stats extends Level {
    onLoad(): void {
        let e = new Entity();

        const lang = getDict();

        const cookieMsg = lang.cookies + ": " + globalStorage.getEatenCookiesAmount() + " / " + globalStorage.allCookiesAmount;
        const diffms = globalStorage.getDuration();

        let min = Math.floor(diffms / 1000 / 60);
        let sek = Math.floor(diffms / 1000 - min * 60);

        const timeMsg = lang.time + ": " + (min > 0 ? min + "m " : "") + sek + "s";
        console.log(diffms);

        const deathsMsg = lang.deaths + ": " + globalStorage.getDeaths();

        const checkpointMsg = "Checkpoints: " + globalStorage.getPlacedCheckpointAmount();

        this.add(new Dialog(`${cookieMsg}\n${timeMsg}\n${deathsMsg}\n${checkpointMsg}`, Color.white, 30, 1000, 10, null, "center", 1));
        this.add(new Dialog(`${lang.endRun}\naction2 - X/V/M`, Color.white, 80, 1000, 10, null, "center", 1));

        transition.focus.x = 64;
        transition.focus.y = 64;

        e.storage.restart = false;
        e.set({
            update: () => {
                if (apate.input.isButtonDown("action2") && !e.storage.restart) {
                    e.storage.restart = true;
                    globalStorage.reset();

                    transition.setDuration(200);
                    transition.focus.x = 64;
                    transition.focus.y = 64;

                    levelLoader.currentLevel = null;
                    levelLoader.loadNext();
                }
            },
        });
        this.add(e);
    }
}
