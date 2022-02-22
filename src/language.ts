import { globalStorage } from "./game.js";

interface LangDict {
    langName: string;
    crystal_info: string;
    stranger: string[];
    start: string;
    deaths: string;
    time: string;
    cookie: string;
    cookies: string;
    summit: string;
    whoami: string;
    endRun: string;
}

const dicts: { [lang: string]: LangDict } = {
    en: {
        langName: "english",
        start: "Start run",
        crystal_info: "throw teleport crystal\naction2 - X/V/M",
        stranger: [
            "Hello!",
            "Do I know you?",
            "It feels like\nI already saw\nyou %1 times...",
            "Well nevermind...\nWhat are you\ndoing here?",
            "You don't know?",
            "Oh...\nthen have a\ngood trip!",
        ],
        deaths: "deaths",
        time: "time",
        cookie: "cookie",
        cookies: "cookies",
        summit: "Summit",
        whoami: "Who am I?",
        endRun: "End run",
    },
    de: {
        langName: "deutsch",
        start: "Lauf starten",
        crystal_info: "teleportkristall werfen\naction2 - X/V/M",
        stranger: [
            "Hallo!",
            "Kennen wir uns?",
            "Es wirkt so\n als hätte ich dich\nschon %1 mal gesehen...",
            "Naja egal\nWas machst du hier?",
            "Du weist es\n nicht?",
            "Na dann\nViel erfolg bei\ndeiner Reise!",
        ],
        deaths: "Tode",
        time: "Zeit",
        cookie: "Keks",
        cookies: "Kekse",
        summit: "Gipfel",
        whoami: "Wer bin Ich?",
        endRun: "Lauf beenden",
    },
    at: {
        langName: "Deitsch",
        start: "stoartn",
        crystal_info: "teleportstoa werfa\naction2 - X/V/M",
        stranger: [
            "Grias di!",
            "Kemma sich?",
            "Es wirkt so\n ois hätt ma uns\nscho %1 moi g'sehn...",
            "Wuarscht\nWos mochma do?",
            "Wissma ned?",
            "Na joa\nVüh Erfoig auf\ndeina Reisn!",
        ],
        deaths: "G'sturbn",
        time: "Zeit",
        cookie: "Kek",
        cookies: "Keks",
        summit: "Spizn",
        whoami: "Wea bin i?",
        endRun: "Spü beendn",
    },
    it: {
        langName: "italiano",
        start: "Inizare il gioco",
        crystal_info: "Lancio del cristallo\ndi teletransporto\naction2 - X/V/M",
        stranger: [
            "Ciao!",
            "Conosciamo?",
            "Mi sembra che\n ti ho gia visto\n%1 volte...",
            "Beh non importa\nCosa fai qua?",
            "Non sai?",
            "Bene allora...\nBuona fortuna per\nil tuo viaggio!",
        ],
        deaths: "Morti",
        time: "tempo",
        cookie: "biscotto",
        cookies: "biscotti",
        summit: "vertice",
        whoami: "Chi sono io?",
        endRun: "Fine della corsa",
    },
};
export var _lang = "en";

if (navigator.language) {
    let short = navigator.language.substring(0, 2);

    setLang(short);

    if (!getLangs().includes(short)) {
        console.warn("No language for: " + short);
    }
}

export function getLangs() {
    return Object.keys(dicts);
}

export function setLang(lang: string) {
    if (dicts[lang]) {
        _lang = lang;
        if (globalStorage) globalStorage._lang = lang;
    }
}

export function getDict() {
    return dicts[_lang];
}
