import jsTPS_Transaction from "../../common/jsTPS.js"

export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, initTitle, initArtist, initYouTubeId) {
        super();
        this.model = initModel;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = initYouTubeId;
    }

    doTransaction() {
        this.model.doSong(this.title, this.artist, this.youTubeId, true);
    }

    undoTransaction() {
        this.model.doSong(this.title, this.artist, this.youTubeId, false);
    }
}