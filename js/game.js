let setup = require('./setup');

let gameOverScreen = require('./gameOverScreen');
let audioPlayer = require('./audioPlayer');
let settings = require('./settings');
let utils = require('./utils');

let background = require('./background');
let level = require('./level');
let bird = require('./bird');

let game = {
    renderer: undefined,
    stage: undefined,

    /**
     * Whether the game (loop) has stopped or not
     */
    hasStopped: false,

    /**
     * Start the game
     */
    start() {
        this.renderer = setup.renderer();
        setup.loadAssets(this.initialize.bind(this));
    },

    /**
     * Initialize all required parts of the game
     */
    initialize() {
        this.stage = new PIXI.Container();

        this.stage.addChild(background.initialize());
        this.stage.addChild(level.initialize());
        this.stage.addChild(bird.initialize());

        this.stage.addChild(this._getWaterSprite());

        let onRestartClick = this._clickRestart.bind(this);
        this.stage.addChild(gameOverScreen.initialize(onRestartClick));

        this.renderer.render(this.stage);

        this._setEvents();

        this.loop();
    },

    /**
     * The game loop
     */
    loop() {
        requestAnimationFrame(this.loop.bind(this));

        // This causes the game loop to freeze. Is used when the players hits something and a menu is shown to _restart
        if (this.hasStopped) return;

        background.loop();
        level.loop();
        bird.loop();

        this._handleCollision();

        this.renderer.render(this.stage);
    },

    /**
     * Trigger game over happening
     * @private
     */
    _gameOver() {
        this._stop();
        this._playDieAudio();

        // Show game over screen
        gameOverScreen.updateScores(level.score, level.bestScore);
        gameOverScreen.show();
    },

    /**
     * Function to be called when _restart is clicked from the game over screen
     * @private
     */
    _clickRestart() {
        this._restart();
        gameOverScreen.hide();
    },

    /**
     * Stop the game
     * @private
     */
    _stop() {
        this.hasStopped = true;
    },

    /**
     * Continue the game after stopping
     * @private
     */
    _restart() {
        level.reset();
        bird.reset();

        this.hasStopped = false;
    },

    /**
     * Handle collision between the bird and 'obstacles'
     * @private
     */
    _handleCollision() {
        // Check if the bird is below or underneath the water
        if (bird.getTop() < level.getWaterLevel() && bird.isBelowWater) {
            bird.leaveWater();
        } else if (bird.getTop() >= level.getWaterLevel() && !bird.isBelowWater) {
            bird.enterWater();
        }

        // Ceiling collision
        if (bird.getTop() <= level.ceilingSprite.y + level.ceilingSprite.height) {
            this._gameOver();
        }

        // Floor collision
        if (bird.getBottom() >= level.ceilingSprite.y + level.ceilingSprite.height + settings.playableAreaAboveWater + settings.playableAreaBelowWater) {
            this._gameOver();
        }

        if (level.pipeCollision(bird)) {
            this._gameOver();
        }
    },

    /**
     * Play the audio for when the player dies
     * @private
     */
    _playDieAudio() {
        audioPlayer.play(audioPlayer.audioFragments.HIT,
            audioPlayer.play.bind(audioPlayer, audioPlayer.audioFragments.DIE)
        );
    },

    /**
     * Set the required events for interacting with the game
     * @private
     */
    _setEvents() {
        window.addEventListener("keyup", (e) => {
            if (e.keyCode != 32) return; // Not spacebar
            if (this.hasStopped) {
                this._clickRestart();
                return;
            }
            bird.flap();
        }, false);

        if ("ontouchstart" in window) {
            window.addEventListener("touchstart", () => {
                if (this.hasStopped) return;
                bird.flap();
            });
        } else {
            window.addEventListener("mousedown", () => {
                if (this.hasStopped) return;
                bird.flap();
            });
        }
    },

    /**
     * Create and get the tiled sprite for the water
     * @returns {TilingSprite|PIXI.TilingSprite|{enumerable, get}|*}
     * @private
     */
    _getWaterSprite() {
        let waterTexture = utils.getTexture(settings.textures.WATER);
        let waterSprite = new PIXI.extras.TilingSprite(waterTexture, settings.gameWidth, settings.playableAreaBelowWater);
        waterSprite.y = utils.getTexture(settings.textures.CEILING).height + settings.playableAreaAboveWater;

        return waterSprite;
    }
};

module.exports = game;
