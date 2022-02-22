import { levelLoader } from "../game.js";
import { getLevelMetaData, LevelData, LevelMetaData } from "../LevelLoader.js";
import Level from "./Level.js";
import Stats from "./Stats.js";
import TeleportLevel from "./TeleportLevel.js";
import CampLevel from "./CampLevel.js";
import Summit from "./Summit.js";
import Credits from "./Credits.js";
import PostCredit from "./PostCredit.js";
import Level19 from "./Level19.js";

export default function initLevels(levelMetaData: LevelMetaData[]) {
    levelMetaData.push({ name: "level1", spriteName: "1", next: () => getLevelMetaData("level2") });
    levelMetaData.push({
        name: "level2",
        spriteName: "2",
        previous: getLevelMetaData("level1"),
        next: (lvl: Level) => {
            if (lvl.data.player.x > 128) return getLevelMetaData("level3");
            return getLevelMetaData("level2s");
        },
        manipulateData: (data: LevelData) => {
            if (levelLoader.lastLevel && levelLoader.lastLevel.meta.name == "level2s") {
                data.player.x = 64;
                data.player.y = 16;
            }
        },
    });
    levelMetaData.push({ name: "level2s", spriteName: "2s", previous: getLevelMetaData("level2"), next: () => getLevelMetaData("level2") });
    levelMetaData.push({
        name: "level3",
        spriteName: "3",
        previous: getLevelMetaData("level2"),
        next: (lvl: Level) => {
            if (lvl.data.player.x < 200) return getLevelMetaData("level3s");
            return getLevelMetaData("level4");
        },
        manipulateData: (data: LevelData) => {
            if (levelLoader.lastLevel && levelLoader.lastLevel.meta.name == "level3s") {
                data.player.x = 200;
                data.player.y = 24;
            }
        },
    });
    levelMetaData.push({
        name: "level3s",
        spriteName: "3s",
        previous: getLevelMetaData("level3"),
        next: (lvl: Level) => getLevelMetaData("level3"),
    });
    levelMetaData.push({
        name: "level4",
        spriteName: "4",
        previous: getLevelMetaData("level3"),
        next: (lvl: Level) => getLevelMetaData("level5"),
    });
    levelMetaData.push({
        name: "level5",
        spriteName: "5",
        previous: getLevelMetaData("level4"),
        next: (lvl: Level) => getLevelMetaData("crystal"),
    });

    levelMetaData.push({
        name: "crystal",
        instanceOf: TeleportLevel,
        spriteName: "6",
        previous: getLevelMetaData("level5"),
        next: (lvl: Level) => getLevelMetaData("level7"),
    });

    levelMetaData.push({
        name: "level7",
        spriteName: "7",
        previous: getLevelMetaData("crystal"),
        next: (lvl: Level) => {
            console.log(lvl);

            if (lvl.data.player.x < 64) return getLevelMetaData("level7s");
            return getLevelMetaData("level8");
        },
        manipulateData: (data: LevelData) => {
            if (levelLoader.lastLevel && levelLoader.lastLevel.meta.name == "level7s") {
                data.player.x = 40;
                data.player.y = 16;
            }
        },
    });
    levelMetaData.push({
        name: "level7s",
        spriteName: "7s",
        previous: getLevelMetaData("level7"),
        next: (lvl: Level) => getLevelMetaData("level7"),
    });
    levelMetaData.push({
        name: "level8",
        spriteName: "8",
        previous: getLevelMetaData("level7"),
        next: (lvl: Level) => getLevelMetaData("level9"),
    });
    levelMetaData.push({
        name: "level9",
        spriteName: "9",
        previous: getLevelMetaData("level8"),
        next: (lvl: Level) => getLevelMetaData("level10"),
    });
    levelMetaData.push({
        name: "level10",
        spriteName: "10",
        previous: getLevelMetaData("level9"),
        next: (lvl: Level) => {
            if (lvl.data.player.x < 17 * 8) return getLevelMetaData("level10s");
            return getLevelMetaData("camp");
        },
        manipulateData: (data: LevelData) => {
            if (levelLoader.lastLevel && levelLoader.lastLevel.meta.name == "level10s") {
                data.player.x = 8 * 8;
                data.player.y = 8;
            }
        },
    });
    levelMetaData.push({
        name: "level10s",
        spriteName: "10s",
        previous: getLevelMetaData("level10"),
        next: (lvl: Level) => getLevelMetaData("level10"),
    });
    levelMetaData.push({
        name: "camp",
        spriteName: "11",
        instanceOf: CampLevel,
        previous: getLevelMetaData("level10"),
        next: (lvl: Level) => getLevelMetaData("level12"),
    });

    levelMetaData.push({
        name: "level12",
        spriteName: "12",
        previous: getLevelMetaData("camp"),
        next: (lvl: Level) => getLevelMetaData("level13"),
    });
    levelMetaData.push({
        name: "level13",
        spriteName: "13",
        previous: getLevelMetaData("level12"),
        next: (lvl: Level) => {
            if (lvl.data.player.x < 10 * 8) return getLevelMetaData("level13s");
            return getLevelMetaData("level14");
        },
        manipulateData: (data: LevelData) => {
            if (levelLoader.lastLevel && levelLoader.lastLevel.meta.name == "level13s") {
                data.player.x = 6 * 8;
                data.player.y = 8;
            }
        },
    });
    levelMetaData.push({
        name: "level13s",
        spriteName: "13s",
        previous: getLevelMetaData("level13"),
        next: (lvl: Level) => getLevelMetaData("level13"),
    });
    levelMetaData.push({
        name: "level14",
        spriteName: "14",
        previous: getLevelMetaData("level13"),
        next: (lvl: Level) => getLevelMetaData("level15"),
    });
    levelMetaData.push({
        name: "level15",
        spriteName: "15",
        previous: getLevelMetaData("level14"),
        next: (lvl: Level) => getLevelMetaData("level16"),
    });
    levelMetaData.push({
        name: "level16",
        spriteName: "16",
        previous: getLevelMetaData("level15"),
        next: (lvl: Level) => getLevelMetaData("level17"),
    });
    levelMetaData.push({
        name: "level17",
        spriteName: "17",
        previous: getLevelMetaData("level16"),
        next: (lvl: Level) => {
            if (lvl.data.player.x > 8 * 8) return getLevelMetaData("level17s");
            return getLevelMetaData("level18");
        },
        manipulateData: (data: LevelData) => {
            if (levelLoader.lastLevel && levelLoader.lastLevel.meta.name == "level17s") {
                data.player.x = 17 * 8;
                data.player.y = 4 * 8;
            }
        },
    });
    levelMetaData.push({
        name: "level17s",
        spriteName: "17s",
        previous: getLevelMetaData("level17"),
        next: (lvl: Level) => getLevelMetaData("level17"),
    });
    levelMetaData.push({
        name: "level18",
        spriteName: "18",
        previous: getLevelMetaData("level17"),
        next: (lvl: Level) => getLevelMetaData("level19"),
    });
    levelMetaData.push({
        name: "level19",
        spriteName: "19",
        instanceOf: Level19,
        previous: getLevelMetaData("level18"),
        next: (lvl: Level) => getLevelMetaData("summit"),
    });
    levelMetaData.push({
        name: "summit",
        spriteName: "20",
        instanceOf: Summit,
        previous: getLevelMetaData("level19"),
        next: (lvl: Level) => getLevelMetaData("credits"),
    });
    levelMetaData.push({
        name: "credits",
        instanceOf: Credits,
        next: (lvl: Level) => getLevelMetaData("postcredit"),
    });
    levelMetaData.push({
        name: "postcredit",
        spriteName: "1",
        instanceOf: PostCredit,
        next: (lvl: Level) => getLevelMetaData("stats"),
    });

    levelMetaData.push({ name: "stats", instanceOf: Stats, next: (lvl: Level) => null });
}
