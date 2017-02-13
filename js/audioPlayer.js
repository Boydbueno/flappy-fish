let settings = require('./settings');

let audioPlayer = {

    audioFragments: {
        'FLAP': 'sfx_wing.ogg',
        'HIT': 'sfx_hit.ogg',
        'DIE': 'sfx_die.ogg',
        'POINT': 'sfx_point.ogg'
    },

    _audio: [],

    init() {
        // Todo: Maybe we need to wait with starting the game until these have been loaded
        for (let key in this.audioFragments) {
            this._audio[this.audioFragments[key]] = new Audio(settings.soundsPath + this.audioFragments[key]);
        }
    },

    play(audioFragment, callback) {
        if (this._audio[audioFragment].currentTime > 0) {
            this._audio[audioFragment].currentTime = 0;
        }

        this._audio[audioFragment].play();

        if (typeof callback === 'function')
            setTimeout(callback, this._audio[audioFragment].duration * 1000);
    }
};

audioPlayer.init();


module.exports = audioPlayer;
