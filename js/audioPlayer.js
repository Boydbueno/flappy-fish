let settings = require('./settings');

let audioPlayer = {

    /**
     * Use this volume for all audio
     */
    volume: 0.5,

    audioFragments: {
        'FLAP': 'sfx_wing.ogg',
        'HIT': 'sfx_hit.ogg',
        'DIE': 'sfx_die.ogg',
        'POINT': 'sfx_point.ogg',
        'SWIM': 'sfx_blub.ogg',
        'ENTER_WATER': 'sfx_water-enter.ogg',
        'EXIT_WATER': 'sfx_water-exit.ogg',
    },

    _audio: [],

    init() {
        // Todo: Maybe we need to wait with starting the game until these have been loaded
        for (let key in this.audioFragments) {
            let audio = new Audio(settings.soundsPath + this.audioFragments[key]);
            audio.volume = this.volume;
            this._audio[this.audioFragments[key]] = audio;
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
