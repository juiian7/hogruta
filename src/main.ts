import { spritelib } from "../engine/src/apate.js";
import { apate, globalStorage, levelLoader, spriteLoader } from "./game.js";

async function main() {
    await spriteLoader.load();
    let levelSprites = await spriteLoader.loadLevelSprites();

    globalStorage.countCookies(levelSprites);

    apate.run();

    levelLoader.loadNext();

    //await levelLoader.load(getLevelMetaData(globalStorage.currentLevelName));

    /*let text = await spritelib.load("/engine/res/default_text.png");
    console.log(spriteLoader.toDataUrl(text));*/
}

// 18 -> (stronger changed gravity) (teleport and jumps) (collect cookies) (cookie) long?
// 19 -> simple level destroy teleport crystal

// more background elements

main();
