let setup = require('./setup');
let background = require('./background');
let level = require('./level');
let bird = require('./bird');

let audioPlayer = require('./audioPlayer');
let settings =  require('./settings');
import * as utils from "./utils";

let game = {

    renderer: undefined,
    stage: undefined,
    gameOverContainer: undefined,


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

        bird.initialize();
        this.stage.addChild(bird.getElement());

        // Render the water
        let waterTexture = utils.getTexture(settings.textures.WATER);
        let waterSprite = new PIXI.extras.TilingSprite(waterTexture, window.innerWidth, settings.playableAreaBelowWater);
        waterSprite.y = utils.getTexture(settings.textures.ceiling).height + settings.playableAreaAboveWater;
        this.stage.addChild(waterSprite);

        this.stage.addChild(this._createGameOverScreen());

        this.renderer.render(this.stage);

        // Todo: Add proper input handling
        window.addEventListener("keyup", (e) => {
            if (e.keyCode != 32) return; // Not spacebar
            if (this.hasStopped) {
                this._clickRestart();
            } else {
                bird.flap();
            }
        }, false);

        if ("ontouchstart" in window)
            window.addEventListener("touchstart", () => {
                if (this.hasStopped) return;
                bird.flap();
            });
        else
            window.addEventListener("mousedown", () => {
                if (this.hasStopped) return;
                bird.flap();
            });

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
            bird.leaveWater();
        } else if (bird.getTop() >= level.getWaterLevel() && !bird.isBelowWater) {
            bird.enterWater();
        }

        // Ceiling collision
        if (bird.getTop() <= level.ceilingSprite.y + level.ceilingSprite.height) {
            this.gameOver();
        }

        // Floor collision
        if (bird.getBottom() >= level.ceilingSprite.y + level.ceilingSprite.height + settings.playableAreaAboveWater + settings.playableAreaBelowWater) {
            this.gameOver();
        }

        if (level.pipeCollision(bird)) {
            this.gameOver();
        }

        this.renderer.render(this.stage);
    },

    gameOver() {
        this.stop();
        this._playDieAudio();

        // Show game over screen
        this.gameOverContainer.removeChild(this.scoreSprite);
        this.gameOverContainer.removeChild(this.bestScoreSprite);

        this.scoreSprite = utils.scoreToSprites(level.score, utils.scoreSize.SMALL);
        this.scoreSprite.x = this.gameOverScreen.width / 2 - this.scoreSprite.width / 2 + 2;
        this.scoreSprite.y = 93;

        this.bestScoreSprite = utils.scoreToSprites(level.bestScore, utils.scoreSize.SMALL);
        this.bestScoreSprite.x = this.gameOverScreen.width / 2 - this.bestScoreSprite.width / 2 + 2;
        this.bestScoreSprite.y = 135;

        this.gameOverContainer.addChild(this.scoreSprite);
        this.gameOverContainer.addChild(this.bestScoreSprite);

        this.gameOverContainer.visible = true;
    },

    _createGameOverScreen() {
        this.gameOverContainer = new PIXI.Container();
        this.gameOverContainer.y = (level.ceilingSprite.height + settings.playableAreaAboveWater + settings.playableAreaBelowWater) / 2 - utils.getTexture(settings.textures.GAME_OVER).height / 2;
        this.gameOverContainer.x = 150;

        this.gameOverScreen = new PIXI.Sprite(utils.getTexture(settings.textures.GAME_OVER));

        this.gameOverContainer.addChild(this.gameOverScreen);

        this.scoreSprite = utils.scoreToSprites(level.score, utils.scoreSize.SMALL);
        this.scoreSprite.x = this.gameOverScreen.width / 2 - this.scoreSprite.width / 2 + 2;
        this.scoreSprite.y = 93;

        this.bestScoreSprite = utils.scoreToSprites(level.bestScore, utils.scoreSize.SMALL);
        this.bestScoreSprite.x = this.gameOverScreen.width / 2 - this.bestScoreSprite.width / 2 + 2;
        this.bestScoreSprite.y = 135;

        this.gameOverContainer.addChild(this.scoreSprite);
        this.gameOverContainer.addChild(this.bestScoreSprite);

        let restartButton = new PIXI.Sprite(utils.getTexture(settings.textures.RESTART));
        restartButton.x = this.gameOverScreen.width / 2 - restartButton.width / 2 + 2;
        restartButton.y = 190;
        restartButton.interactive = true;
        restartButton.buttonMode = true;
        restartButton.defaultCursor = 'pointer';

        restartButton.addListener("click", this._clickRestart.bind(this));

        if ("ontouchstart" in window) {
            restartButton.addListener("touchstart", this._clickRestart.bind(this));
        }

        this.gameOverContainer.addChild(restartButton);

        this.gameOverContainer.visible = false;

        return this.gameOverContainer;
    },

    _clickRestart() {
        this.restart();
        this.gameOverContainer.visible = false;
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
    restart() {
        level.reset();
        bird.reset();

        this.hasStopped = false;
    },

    _playDieAudio() {
        audioPlayer.play(audioPlayer.audioFragments.HIT,
            audioPlayer.play.bind(audioPlayer, audioPlayer.audioFragments.DIE)
        );
    }

};

module.exports = game;
