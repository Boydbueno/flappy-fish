let setup = require('./setup');
let background = require('./background');
let level = require('./level');
let bird = require('./bird');

let audioPlayer = require('./audioPlayer');

let game = {

    renderer: undefined,
    stage: undefined,

    hasStopped: false,

    /**
     * Start the game
     */
    start() {
        this.renderer  = setup.renderer();
        setup.loadAssets(this.initialize.bind(this));
    },

    /**
     * Initialize all required parts of the game
     */
    initialize() {
        this.stage = new PIXI.Container();

        background.initialize();
        this.stage.addChild(background.getElement());

        level.initialize();
        this.stage.addChild(level.getElement());

        // Spawn the pipes

        bird.initialize();
        this.stage.addChild(bird.getElement());

        this.renderer.render(this.stage);

        // Todo: Add proper input handling
        window.addEventListener("keyup", () => {
            if (this.hasStopped) return;
            bird.flap();
        }, false);

        this.loop();
    },

    /**
     * The game loop
     */
    loop() {
        requestAnimationFrame(this.loop.bind(this));

        // This basically causes the game to 'freeze'. This should change the updating to menu and such
        if (this.hasStopped) return;

        background.loop();
        level.loop();
        bird.loop();

        // Check if the bird is below or underneath the water
        if (bird.getTop() < level.getWaterLevel() && bird.isBelowWater) {
            bird.isBelowWater = false;
        } else if (bird.getTop() >= level.getWaterLevel() && !bird.isBelowWater) {
            bird.isBelowWater = true;
        }

        // Ceiling collision
        if (bird.getTop() <= level.ceilingSprite.y + level.ceilingSprite.height) {
            this.stop();
            this._playDieAudio();
        }

        if (level.pipeCollision(bird)) {
            this.stop();
            this._playDieAudio();
        }

        this.renderer.render(this.stage);
    },

    /**
     * Stop the game
     */
    stop() {
        this.hasStopped = true;
    },

    /**
     * Continue the game after stopping
     * Make sure bird is no longer colliding or it'll stop again instantly
     */
    play() {
        this.hasStopped = false;
    },

    _playDieAudio() {
        audioPlayer.play(audioPlayer.audioFragments.HIT,
            audioPlayer.play.bind(audioPlayer, audioPlayer.audioFragments.DIE)
        );
    }

};

module.exports = game;
