import jsTPS from "../common/jsTPS.js";
import Playlist from "./Playlist.js";
import MoveSong_Transaction from "./transactions/MoveSong_Transaction.js";
import AddSong_Transaction from "./transactions/AddSong_Transaction.js";
import EditSong_Transaction from "./transactions/EditSong_Transaction.js";
import DeleteSong_Transaction from "./transactions/DeleteSong_Transaction.js";

/**
 * PlaylisterModel.js
 * 
 * This class manages all playlist data for updating and accessing songs
 * as well as for loading and unloading lists. Note that editing should employ
 * an undo/redo mechanism for any editing features that change a loaded list
 * should employ transactions the jsTPS.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class PlaylisterModel {
    /*
        constructor

        Initializes all data for this application.
    */
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.playlists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;

        // THE MODAL IS NOT CURRENTLY OPEN
        this.confirmDialogOpen = false;
        this.editDialogOpen = false;
    }

    // FOR MVC STUFF
    
    setView(initView) {
        this.view = initView;
    }

    refreshToolbar() {
        this.view.updateToolbarButtons(this);
    }

    addListOff() {
        this.view.disableButton("add-list-button");
    }

    listLoaded(isLoad) {
        if (isLoad) {
            this.view.disableButton("add-list-button");
            this.refreshToolbar();
        } else {
            this.view.enableButton("add-list-button");
            this.view.disableButton("add-song-button");
            this.view.disableButton("undo-button");
            this.view.disableButton("redo-button");
            this.view.disableButton("close-button");
        }
    }
    
    undoOn(){
        this.view.enableButton("undo-button");
    }

    undoOff() {
        this.view.disableButton("undo-button");
    }

    redoOn(){
        this.view.enableButton("redo-button");
    }

    redoOff(){
        this.view.disableButton("redo-button");
    }

    // FIRST WE HAVE THE ACCESSOR (get) AND MUTATOR (set) METHODS
    // THAT GET AND SET BASIC VALUES NEEDED FOR COORDINATING INTERACTIONS
    // AND DISPLAY

    getList(index) {
        return this.playlists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.playlists.length; i++) {
            let list = this.playlists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    getPlaylistSize() {
        return this.currentList.songs.length;
    }

    getSong(index) {
        return this.currentList.songs[index];
    }

    getDeleteListId() {
        return this.deleteListId;
    }

    setDeleteListId(initId) {
        this.deleteListId = initId;
    }

    toggleConfirmDialogOpen() {
        this.confirmDialogOpen = !this.confirmDialogOpen;
        this.view.updateToolbarButtons(this);
        return this.confirmDialogOpen;
    }

    toggleEditDialogOpen() {
        this.editDialogOpen = !this.editDialogOpen;
        this.view.updateToolbarButtons(this);
        return this.editDialogOpen;
    }

    // THESE ARE THE FUNCTIONS FOR MANAGING ALL THE LISTS

    addNewList(initName, initSongs) {
        let newList = new Playlist(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initSongs)
            newList.setSongs(initSongs);
        this.playlists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.playlists);
        return newList;
    }

    // ADD A NEW SONG
    
    addNewSong(initTitle, initArtist, initYouTubeId) {
        if(this.hasCurrentList()) {
            let newSong = this.currentList.addSong(initTitle, initArtist, initYouTubeId);
            this.view.refreshPlaylist(this.currentList);
            this.saveLists();
        }
    }

    sortLists() {
        this.playlists.sort((listA, listB) => {
            if (listA.getName().toUpperCase() < listB.getName().toUpperCase()) {
                return -1;
            }
            else if (listA.getName().toUpperCase() === listB.getName().toUpperCase()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.playlists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.playlists.length; i++) {
            let list = this.playlists[i];
            this.view.unhighlightList(list.id); // Was : this.view.unhighlightList(i);
        }
    }

    loadList(id) {
        // If user attempts to reload the currentList, then do nothing.
        if (this.hasCurrentList() && id === this.currentList.id) {
            this.view.highlightList(id);
            return;
        }

        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.playlists.length) && !found) {
            list = this.playlists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.refreshPlaylist(this.currentList);
                this.view.highlightList(id); // Was : this.view.highlightList(i);
                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateStatusBar(this);
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.playlists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let songs = [];
                for (let j = 0; j < listData.songs.length; j++) {
                    songs[j] = listData.songs[j];
                }
                this.addNewList(listData.name, songs);
            }
            this.sortLists();   
            this.view.refreshLists(this.playlists);
            return true;
        }        
    }

    saveLists() {
        let playlistsString = JSON.stringify(this.playlists);
        localStorage.setItem("recent_work", playlistsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    unselectCurrentList() {
        if (this.hasCurrentList()) {
            this.currentList = null;
            this.view.updateStatusBar(this);
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateToolbarButtons(this);
        }
    }

    renameCurrentList(initName, id) {
        if (this.hasCurrentList()) {
            let targetList = this.playlists[this.getListIndex(id)];

            if (initName === "") {
                targetList.setName("Untitled");
            } else {
                targetList.setName(initName);
            }

            this.sortLists(); 
            this.view.highlightList(id);
            this.saveLists();
            this.view.updateStatusBar(this);
        }
    }

    editSong(title, artist, youTubeId, index) {
        let targetSong = this.currentList.getSongAt(index);
        if (title === "") {
            targetSong.title = "Untitled";
        } else {
            targetSong.title = title;
        }
        if (artist === "") {
            targetSong.artist = "Unknown";
        } else {
            targetSong.artist = artist;
        }
        if (youTubeId === "") {
            targetSong.youTubeId = "dQw4w9WgXcQ";
        } else {
            targetSong.youTubeId = youTubeId;
        }
        this.view.refreshPlaylist(this.currentList);
    }

    deleteList(id) {
        let toBeDeleted = this.playlists[this.getListIndex(id)];
        this.playlists = this.playlists.filter(list => list.id !== id);
        this.view.refreshLists(this.playlists)
        // 2 cases, deleted is current list
        // deleted is not current list
        if (toBeDeleted == this.currentList) {
            this.currentList = null;
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateStatusBar(this);
        } else if (this.hasCurrentList()) {
            this.view.highlightList(this.currentList.id);
        }
        this.saveLists();
    }

    deleteSong(i) {
        let songToBeDeleted = this.getSong(i);
        this.currentList.songs = this.currentList.songs.filter(song => song !== songToBeDeleted);
        this.view.refreshPlaylist(this.currentList);
        this.saveLists();
    }

    // NEXT WE HAVE THE FUNCTIONS THAT ACTUALLY UPDATE THE LOADED LIST

    moveSong(fromIndex, toIndex) {
        if (this.hasCurrentList()) {
            let tempArray = this.currentList.songs.filter((song, index) => index !== fromIndex);
            tempArray.splice(toIndex, 0, this.currentList.getSongAt(fromIndex))
            this.currentList.songs = tempArray;
            this.view.refreshPlaylist(this.currentList);
        }
        this.saveLists();
    }

    doSong(initTitle, initArtist, initYouTubeId, isDo) {
        if (this.hasCurrentList()) {
            if (isDo) {
                this.addNewSong(initTitle, initArtist, initYouTubeId);
            }else {
                this.currentList.songs = this.currentList.songs.slice(0, this.currentList.songs.length-1);
                this.view.refreshPlaylist(this.currentList);
            }
        }
    }

    doDeleteSong(i, title, artist, youTubeId, isDo) {
        if (this.hasCurrentList()) {
            if (isDo) {
                this.deleteSong(i);
            }else {
                this.addNewSong(title, artist, youTubeId);
                this.moveSong((this.currentList.songs.length-1), i);
            }
        }
    }

    // SIMPLE UNDO/REDO FUNCTIONS, NOTE THESE USE TRANSACTIONS

    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    // NOW THE FUNCTIONS THAT CREATE AND ADD TRANSACTIONS
    // TO THE TRANSACTION STACK

    addMoveSongTransaction(fromIndex, onIndex) {
        let transaction = new MoveSong_Transaction(this, fromIndex, onIndex);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
        this.undoOn();
    }

    addAddSongTransaction(initTitle, initArtist, initYouTubeId) {
        let transaction = new AddSong_Transaction(this, initTitle, initArtist, initYouTubeId);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
        this.undoOn();
    }

    addEditSongTransaction(oldT, oldA, oldY, newT, newA, newY, i) {
        let transaction = new EditSong_Transaction(this, oldT, oldA, oldY, newT, newA, newY, i);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    addDeleteSongTransaction(i) {
        let transaction = new DeleteSong_Transaction(this, i);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }
}