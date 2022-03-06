interface Track {
    name: string;
    audioBuffer: AudioBuffer;
    location: string;
}

export default class Audio {
    private actx: AudioContext;
    private gainNode: GainNode;
    public filterNode: BiquadFilterNode;

    private _useFilter: boolean = false;

    public set isFilterActive(val: boolean) {
        this._useFilter = val;

        for (let i = 0; i < this.audioNodes.length; i++) {
            this.audioNodes[i].disconnect();
            this.audioNodes[i].connect(this._useFilter ? this.filterNode : this.gainNode);
        }
    }

    public get isFilterActive() {
        return this._useFilter;
    }

    private trackList: Track[] = [];

    constructor() {
        this.actx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;

        this.gainNode = this.actx.createGain();
        this.filterNode = this.actx.createBiquadFilter();

        this.gainNode.connect(this.actx.destination);
        this.filterNode.connect(this.gainNode);

        //this.actx.resume();
    }

    public async loadTrack(name: string, path: string): Promise<Track> {
        this.trackList.push({ name, location: path, audioBuffer: await this.getFile(path) });
        return this.trackList[this.trackList.length - 1];
    }

    public set volume(percent: number) {
        this.gainNode.gain.value = percent / 100;
    }

    private async getFile(filepath: string) {
        const response = await fetch(filepath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.actx.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    public getTrack(name: string): Track {
        return this.trackList.find((t) => t.name == name);
    }

    private audioNodes: AudioNode[] = [];

    public playTrack(track: string | Track, delay: number = 0, loop: boolean = false) {
        if (typeof track == "string") track = this.getTrack(track);

        if (track) {
            let bs = this.actx.createBufferSource();
            bs.buffer = track.audioBuffer;
            bs.loop = loop;
            bs.connect(this._useFilter ? this.filterNode : this.gainNode);
            bs.start(delay);

            this.audioNodes.push(bs);

            return bs;
        }
    }

    public setFilter(type: BiquadFilterType, frequency: number) {
        this.audioNodes.forEach((n) => n.connect(this.filterNode));

        this.filterNode.type = type;
        this.filterNode.frequency.value = frequency;
    }
}
