import { apate, audio, Button, globalStorage, levelLoader, spriteLoader } from "./game.js";

async function main() {
    await spriteLoader.load();
    let levelSprites = await spriteLoader.loadLevelSprites();

    globalStorage.countCookies(levelSprites);

    apate.run();

    levelLoader.loadNext();

    await audio.loadTrack("bg", "./res/bg.mp3");
    await audio.loadTrack("dead", "./res/dead.mp3");

    audio.volume = 10;

    audio.playTrack("bg", 0, true);

    audio.setFilter("lowpass", 440);
    //audio.isFilterActive = true;

    /*let text = await spritelib.load("/engine/res/default_text.png");
    console.log(spriteLoader.toDataUrl(text));*/
}

// - bobane
// more background elements?

main();
