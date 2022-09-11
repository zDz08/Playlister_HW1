/**
 * Playlist.js
 * 
 * This class represents our playlist.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Playlist {
    constructor(initId) {
        this.id = initId;
    }

    getName() {
        return this.name;
    }

    setName(initName) {
        this.name = initName;
    }

    getSongAt(index) {
        return this.songs[index];
    }

    setSongAt(index, song) {
        this.songs[index] = song;
    }

    addSong(initTitle, initArtist, initYouTubeId) {
        this.songs.push({});
        this.songs[this.songs.length-1].title = initTitle;
        this.songs[this.songs.length-1].artist = initArtist;
        this.songs[this.songs.length-1].youTubeId = initYouTubeId;
    }

    setSongs(initSongs) {
        this.songs = initSongs;
    }

    moveSong(oldIndex, newIndex) {
        this.songs.splice(newIndex, 0, this.songs.splice(oldIndex, 1)[0]);
    }
}