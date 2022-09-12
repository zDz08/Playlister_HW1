import jsTPS_Transaction from "../../common/jsTPS.js"

export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, i) {
        super();
        this.model = initModel;
        this.i = i;
        this.song = this.model.getSong(this.i);
    }

    doTransaction() {
        this.model.doDeleteSong(this.i, this.song.title, this.song.artist, this.song.youTubeId, true);
    }

    undoTransaction() {
        this.model.doDeleteSong(this.i, this.song.title, this.song.artist, this.song.youTubeId, false);
    }
}