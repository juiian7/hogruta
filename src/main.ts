import { apate, Button, globalStorage, levelLoader, spriteLoader } from "./game.js";

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

// - bobane
// more background elements?

// restart (P) and loading level causing error

main();

/*let audio = document.createElement("audio");
audio.src = "/res/sound.mp3";
audio.addEventListener("timeupdate", () => {
    //console.log(this);
    console.log(audio.currentTime);
});
audio.play();
*/

const actx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;

async function initAudio() {
    const p1 = actx.createBufferSource();
    const p2 = actx.createBufferSource();

    const gain = actx.createGain();

    p1.buffer = await getFile("./res/p1.mp3");
    p2.buffer = await getFile("./res/p2.mp3");

    p1.connect(gain);
    p2.connect(gain);

    gain.connect(actx.destination);

    gain.gain.value = 0.1;

    p2.loop = true;

    let d = p1.buffer.duration;

    p1.start(0);
    p2.start(d);

    console.log("Started playing");
}
initAudio();

async function getFile(filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await actx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}
