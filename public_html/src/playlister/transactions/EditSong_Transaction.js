import jsTPS_Transaction from "../../common/jsTPS.js"

export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, oldT, oldA, oldY, newT, newA, newY, i) {
        super();
        this.model = initModel;
        this.oldT = oldT;
        this.oldA = oldA;
        this.oldY = oldY;
        this.newT = newT;
        this.newA = newA;
        this.newY = newY;
        this.i = i;
    }

    doTransaction() {
        this.model.editSong(this.newT, this.newA, this.newY, this.i);
    }

    undoTransaction() {
        this.model.editSong(this.oldT, this.oldA, this.oldY, this.i);
    }
}