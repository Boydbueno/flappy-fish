(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var game = require('./game');

(function () {
    game.start();
})();

},{"./game":6}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = require('./settings');
var utils = require('./utils');

var Pipe = function () {
    function Pipe(height, facing) {
        _classCallCheck(this, Pipe);

        this.height = height;
        this.facing = facing;

        this.pipeTexture = utils.getTexture(settings.textures.PIPE);
        this.pipeTopTexture = utils.getTexture(settings.textures.PIPE_UP);
        this.pipeBottomTexture = utils.getTexture(settings.textures.PIPE_DOWN);

        this._container = new PIXI.Container();

        var totalPlayHeight = settings.playableAreaAboveWater + settings.playableAreaBelowWater;

        if (facing === Pipe.UP) {
            this._container.addChild(this._createUpFacingPipe(height));
        } else if (facing === Pipe.DOWN) {
            this._container.addChild(this._createDownFacingPipe(height));
        }

        // Check if we have space for pipe in opposite direction to complete the gap
        if (height + settings.pipeGapSize < totalPlayHeight) {
            // We can fit another pipe opposite to it
            var oppositePipeHeight = totalPlayHeight - height - settings.pipeGapSize;
            if (facing === Pipe.UP) this._container.addChild(this._createDownFacingPipe(oppositePipeHeight));

            if (facing === Pipe.DOWN) this._container.addChild(this._createUpFacingPipe(oppositePipeHeight));
        }

        var ceilingSpriteHeight = utils.getTexture(settings.textures.CEILING).height;

        // Store the information of the gap position in the container object for easier collision checks
        var top = (facing === Pipe.UP ? totalPlayHeight - height - settings.pipeGapSize : height) + ceilingSpriteHeight;
        var bottom = (facing === Pipe.UP ? totalPlayHeight - height : height + settings.pipeGapSize) + ceilingSpriteHeight;
        this.container.gap = { top: top, bottom: bottom };
    }

    _createClass(Pipe, [{
        key: '_createUpFacingPipe',
        value: function _createUpFacingPipe(height) {
            var container = new PIXI.Container();

            var pipeTop = new PIXI.Sprite(this.pipeTopTexture);
            container.addChild(pipeTop);

            var pipePartHeight = height - this.pipeTopTexture.height;

            var pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
            pipe.y = this.pipeTopTexture.height;
            container.addChild(pipe);

            // Place pipe on the bottom
            container.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater - height + utils.getTexture(settings.textures.CEILING).height;

            return container;
        }
    }, {
        key: '_createDownFacingPipe',
        value: function _createDownFacingPipe(height) {
            var container = new PIXI.Container();

            var pipePartHeight = height - this.pipeBottomTexture.height;

            var pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
            container.addChild(pipe);

            var pipeBottom = new PIXI.Sprite(this.pipeBottomTexture);
            pipeBottom.y = pipePartHeight;
            container.addChild(pipeBottom);

            // We can place it against the ceiling
            container.y = utils.getTexture(settings.textures.CEILING).height;

            return container;
        }
    }, {
        key: 'container',
        get: function get() {
            return this._container;
        },
        set: function set(container) {
            this._container = container;
        }
    }], [{
        key: 'textureWidth',
        get: function get() {
            return utils.getTexture(settings.textures.PIPE).width;
        }
    }, {
        key: 'UP',
        get: function get() {
            return 1;
        }
    }, {
        key: 'DOWN',
        get: function get() {
            return -1;
        }
    }]);

    return Pipe;
}();

module.exports = Pipe;

},{"./settings":9,"./utils":11}],3:[function(require,module,exports){
'use strict';

var settings = require('./settings');

var audioPlayer = {

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
        'EXIT_WATER': 'sfx_water-exit.ogg'
    },

    _audio: [],

    init: function init() {
        // Todo: Maybe we need to wait with starting the game until these have been loaded
        for (var key in this.audioFragments) {
            var audio = new Audio(settings.soundsPath + this.audioFragments[key]);
            audio.volume = this.volume;
            this._audio[this.audioFragments[key]] = audio;
        }
    },
    play: function play(audioFragment, callback) {
        if (this._audio[audioFragment].currentTime > 0) {
            this._audio[audioFragment].currentTime = 0;
        }

        this._audio[audioFragment].play();

        if (typeof callback === 'function') setTimeout(callback, this._audio[audioFragment].duration * 1000);
    }
};

audioPlayer.init();

module.exports = audioPlayer;

},{"./settings":9}],4:[function(require,module,exports){
'use strict';

var settings = require('./settings.js');
var utils = require('./utils.js');

var background = {
    /**
     * The container that will contain all background tiles lined up
     */
    backgroundSprite: undefined,

    /**
     * Initialize the background
     * @returns {PIXI.Sprite}
     */
    initialize: function initialize() {
        var skyTileTexture = utils.getTexture(settings.textures.BACKGROUND);
        this.backgroundSprite = new PIXI.extras.TilingSprite(skyTileTexture, settings.gameWidth, skyTileTexture.height);
        this.backgroundSprite.y = this._getBackgroundSpriteYPosition(skyTileTexture.height);

        return this.backgroundSprite;
    },


    /**
     * Update loop of the background
     */
    loop: function loop() {
        this.backgroundSprite.tilePosition.x += -settings.backgroundSpeed;
    },


    /**
     * Get the y position for the background sprite
     * @returns {Number}
     * @private
     */
    _getBackgroundSpriteYPosition: function _getBackgroundSpriteYPosition(height) {
        return settings.playableAreaAboveWater - height + utils.getTexture(settings.textures.CEILING).height;
    }
};

module.exports = background;

},{"./settings.js":9,"./utils.js":11}],5:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils');

var audioPlayer = require('./audioPlayer');

var bird = {
    sprite: undefined,

    /**
     * The velocity of the bird
     */
    velocity: 0,

    /**
     * Bool if the bird is below the water
     */
    isBelowWater: false,

    /**
     * The amount of frames the animation has
     */
    animationFrames: 4,

    birdTextureNamePrefix: 'bird_',
    birdTextureNameSuffix: '.png',

    initialize: function initialize() {
        this.sprite = this._setupBirdSprite();
        return this.sprite;
    },
    loop: function loop() {
        if (this.isBelowWater) {
            this.velocity -= settings.waterPushForce;
        } else {
            this.velocity += settings.gravity;
        }

        this.sprite.y += this.velocity;
        this.sprite.rotation = Math.atan2(this.velocity, settings.forwardSpeed);
    },


    /**
     * Flap behaviour, is different based on being below or above water
     */
    flap: function flap() {
        // Setting to easily test different flap behaviour
        if (settings.shouldBirdFlapResetVelocity) {
            this.velocity = 0;
        }

        if (this.isBelowWater) {
            this._swim();
        } else {
            this._flap();
        }
    },


    /**
     * Reset the position and velocity of the bird
     */
    reset: function reset() {
        this.sprite.x = settings.birdStartPosition.x;
        this.sprite.y = settings.birdStartPosition.y;
        this.velocity = 0;
    },


    /**
     * Simple helper function to get the top position of the bird
     * @returns {number}
     */
    getTop: function getTop() {
        return this.sprite.y - this.sprite.height / 2;
    },


    /**
     * Simple helper function to get the bottom position of the bird
     * @returns {number}
     */
    getBottom: function getBottom() {
        return this.sprite.y + this.sprite.height / 2;
    },


    /**
     * Simple helper function to get the right position of the bird
     * @returns {number}
     */
    getRight: function getRight() {
        return this.sprite.x + this.sprite.width / 2;
    },


    /**
     * Simple helper function to get the left position of the bird
     * @returns {number}
     */
    getLeft: function getLeft() {
        return this.sprite.x - this.sprite.width / 2;
    },
    getCenter: function getCenter() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    },


    /**
     * When the bird enters the water
     */
    enterWater: function enterWater() {
        if (this.isBelowWater) return;
        this.isBelowWater = true;

        audioPlayer.play(audioPlayer.audioFragments.ENTER_WATER);
    },


    /**
     * When the bird leaves the water
     */
    leaveWater: function leaveWater() {
        if (!this.isBelowWater) return;
        this.isBelowWater = false;

        audioPlayer.play(audioPlayer.audioFragments.EXIT_WATER);
    },


    /**
     * Setup the bird sprite with its animations
     * @returns {AnimatedSprite|*}
     * @private
     */
    _setupBirdSprite: function _setupBirdSprite() {
        var spriteFrames = [];
        for (var i = 0; i < this.animationFrames; i++) {
            spriteFrames.push(utils.getTexture(this.birdTextureNamePrefix + i + this.birdTextureNameSuffix));
        }

        var sprite = new PIXI.extras.AnimatedSprite(spriteFrames);

        sprite.animationSpeed = settings.birdAnimationSpeed;
        sprite.play();

        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        sprite.x = settings.birdStartPosition.x;
        sprite.y = settings.birdStartPosition.y;

        return sprite;
    },


    /**
     * The above water flap behaviour
     * @private
     */
    _flap: function _flap() {
        audioPlayer.play(audioPlayer.audioFragments.FLAP);

        this.velocity -= settings.birdFlapVelocity;
    },


    /**
     * The below water flap (aka swim) behaviour
     * @private
     */
    _swim: function _swim() {
        audioPlayer.play(audioPlayer.audioFragments.SWIM);

        this.velocity += settings.birdFlapVelocity;
    }
};

module.exports = bird;

},{"./audioPlayer":3,"./settings":9,"./utils":11}],6:[function(require,module,exports){
'use strict';

var setup = require('./setup');

var gameOverScreen = require('./gameOverScreen');
var audioPlayer = require('./audioPlayer');
var settings = require('./settings');
var utils = require('./utils');

var background = require('./background');
var level = require('./level');
var bird = require('./bird');

var game = {
    renderer: undefined,
    stage: undefined,

    /**
     * Whether the game (loop) has stopped or not
     */
    hasStopped: false,

    /**
     * Start the game
     */
    start: function start() {
        this.renderer = setup.renderer();
        setup.loadAssets(this.initialize.bind(this));
    },


    /**
     * Initialize all required parts of the game
     */
    initialize: function initialize() {
        this.stage = new PIXI.Container();

        this.stage.addChild(background.initialize());
        this.stage.addChild(level.initialize());
        this.stage.addChild(bird.initialize());

        this.stage.addChild(this._getWaterSprite());

        var onRestartClick = this._clickRestart.bind(this);
        this.stage.addChild(gameOverScreen.initialize(onRestartClick));

        this.renderer.render(this.stage);

        this._setEvents();

        this.loop();
    },


    /**
     * The game loop
     */
    loop: function loop() {
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
    _gameOver: function _gameOver() {
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
    _clickRestart: function _clickRestart() {
        this._restart();
        gameOverScreen.hide();
    },


    /**
     * Stop the game
     * @private
     */
    _stop: function _stop() {
        this.hasStopped = true;
    },


    /**
     * Continue the game after stopping
     * @private
     */
    _restart: function _restart() {
        level.reset();
        bird.reset();

        this.hasStopped = false;
    },


    /**
     * Handle collision between the bird and 'obstacles'
     * @private
     */
    _handleCollision: function _handleCollision() {
        // Check if the bird is below or underneath the water
        if (bird.getCenter().y <= level.getWaterLevel() && bird.isBelowWater) {
            bird.leaveWater();
        } else if (bird.getCenter().y > level.getWaterLevel() && !bird.isBelowWater) {
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
    _playDieAudio: function _playDieAudio() {
        audioPlayer.play(audioPlayer.audioFragments.HIT, audioPlayer.play.bind(audioPlayer, audioPlayer.audioFragments.DIE));
    },


    /**
     * Set the required events for interacting with the game
     * @private
     */
    _setEvents: function _setEvents() {
        var _this = this;

        window.addEventListener("keydown", function (e) {
            if (e.keyCode != 32) return; // Not spacebar
            if (_this.hasStopped) {
                _this._clickRestart();
                return;
            }
            bird.flap();
        }, false);

        if ("ontouchstart" in window) {
            window.addEventListener("touchstart", function () {
                if (_this.hasStopped) return;
                bird.flap();
            });
        } else {
            window.addEventListener("mousedown", function () {
                if (_this.hasStopped) return;
                bird.flap();
            });
        }
    },


    /**
     * Create and get the tiled sprite for the water
     * @returns {TilingSprite|PIXI.TilingSprite|{enumerable, get}|*}
     * @private
     */
    _getWaterSprite: function _getWaterSprite() {
        var waterTexture = utils.getTexture(settings.textures.WATER);
        var waterSprite = new PIXI.extras.TilingSprite(waterTexture, settings.gameWidth, settings.playableAreaBelowWater);
        waterSprite.y = utils.getTexture(settings.textures.CEILING).height + settings.playableAreaAboveWater;

        return waterSprite;
    }
};

module.exports = game;

},{"./audioPlayer":3,"./background":4,"./bird":5,"./gameOverScreen":7,"./level":8,"./settings":9,"./setup":10,"./utils":11}],7:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils');

var gameOverScreen = {

    /**
     * The callback when the _restart button is clicked
     */
    onClickRestart: undefined,

    /**
     * The container that will hold the game over container
     */
    container: undefined,

    /**
     * The container that will hold the the scores and the game over sprite
     */
    gameOverContainer: undefined,

    scoreYPosition: 93,
    bestScoreYPosition: 135,
    restartButtonYPosition: 190,
    gameOverContainerXPosition: 150,

    /**
     * Because the score box is not perfectly centered we add some offset
     */
    elementsXOffset: 2,

    /**
     * Create the game over screen, should only be called once
     */
    initialize: function initialize(callback) {
        this._setRestartCallback(callback);

        this.container = new PIXI.Container();

        this.container.y = this._getContainerYPosition();
        this.container.x = this.gameOverContainerXPosition;

        this.gameOverContainer = new PIXI.Sprite(utils.getTexture(settings.textures.GAME_OVER));

        this._renderScores(0, 0);

        var restartButton = new PIXI.Sprite(utils.getTexture(settings.textures.RESTART));
        restartButton.x = this.gameOverContainer.width / 2 - restartButton.width / 2 + this.elementsXOffset;
        restartButton.y = this.restartButtonYPosition;
        restartButton.interactive = true;
        restartButton.buttonMode = true;
        restartButton.defaultCursor = 'pointer';

        restartButton.addListener("click", this.onClickRestart);

        if ("ontouchstart" in window) {
            restartButton.addListener("touchstart", this.onClickRestart);
        }

        this.gameOverContainer.addChild(restartButton);

        this.container.addChild(this.gameOverContainer);

        this.hide();

        return this.container;
    },


    /**
     * Update the game over screen with the new scores
     */
    updateScores: function updateScores(score, bestScore) {
        this._clearScores();
        this._renderScores(score, bestScore);
    },


    /**
     * Hide the game over screen
     */
    hide: function hide() {
        this.gameOverContainer.visible = false;
    },


    /**
     * Show the game over screen
     */
    show: function show() {
        this.gameOverContainer.visible = true;
    },


    /**
     * Set the callback for when the _restart button has been pressed
     * @param callback
     * @private
     */
    _setRestartCallback: function _setRestartCallback(callback) {
        if (typeof callback !== 'function') throw new Error('Supplied callback is not a function');

        this.onClickRestart = callback;
    },


    /**
     * @param score
     * @param bestScore
     * @private
     */
    _renderScores: function _renderScores(score, bestScore) {
        this.scoreSprite = utils.scoreToSprites(score, utils.scoreSize.SMALL);
        this.scoreSprite.x = this.gameOverContainer.width / 2 - this.scoreSprite.width / 2 + this.elementsXOffset;
        this.scoreSprite.y = this.scoreYPosition;

        this.bestScoreSprite = utils.scoreToSprites(bestScore, utils.scoreSize.SMALL);
        this.bestScoreSprite.x = this.gameOverContainer.width / 2 - this.bestScoreSprite.width / 2 + this.elementsXOffset;
        this.bestScoreSprite.y = this.bestScoreYPosition;

        this.gameOverContainer.addChild(this.scoreSprite);
        this.gameOverContainer.addChild(this.bestScoreSprite);
    },


    /**
     * @private
     */
    _clearScores: function _clearScores() {
        this.gameOverContainer.removeChild(this.scoreSprite);
        this.gameOverContainer.removeChild(this.bestScoreSprite);
    },


    /**
     * @returns {number}
     * @private
     */
    _getContainerYPosition: function _getContainerYPosition() {
        var ceilingHeight = utils.getTexture(settings.textures.CEILING).height;
        var gameOverScreenHeight = utils.getTexture(settings.textures.GAME_OVER).height;
        return (ceilingHeight + settings.playableAreaAboveWater + settings.playableAreaBelowWater) / 2 - gameOverScreenHeight / 2;
    }
};

module.exports = gameOverScreen;

},{"./settings":9,"./utils":11}],8:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils.js');

var audioPlayer = require('./audioPlayer');

var Pipe = require('./Pipe');

var level = {
    /**
     * The container that will contain everything that needs to be moved towards the player
     */
    container: undefined,

    /**
     * Tiled floor sprite
     */
    floorSprite: undefined,

    /**
     * Tiled ceiling sprite
     */
    ceilingSprite: undefined,

    /**
     * Container that will contain all pipes
     */
    pipesContainer: undefined,

    firstPipeFacing: Pipe.UP,

    nextPipeFacing: 0,
    placedPipesCount: 0,

    playerInsidePipe: false,

    score: 0,
    bestScore: 0,
    scoreContainer: undefined,

    initialize: function initialize() {
        this.container = new PIXI.Container();

        this.container.addChild(this._createCeiling());
        this.container.addChild(this._createFloor());

        this.container.addChild(this._createInitialPipes());

        this.container.addChild(this._createScoreContainer());

        return this.container;
    },
    loop: function loop() {
        this.ceilingSprite.tilePosition.x += -settings.forwardSpeed;
        this.floorSprite.tilePosition.x += -settings.forwardSpeed;

        // Pipes stuff
        this.pipesContainer.x += -settings.forwardSpeed;

        // Remove pipes when they're off screen
        if (this.pipesContainer.children.length > 0) {

            if (this.pipesContainer.x < -this.pipesContainer.children[0].x - Pipe.textureWidth) {
                this.pipesContainer.removeChild(this.pipesContainer.children[0]);
                this._placeNewPipe(this.placedPipesCount);
            }
        }
    },


    /**
     * Reset the state of the level
     */
    reset: function reset() {
        this.score = 0;
        this.scoreContainer.removeChild(this.scoreContainer.children[0]);
        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));

        this.pipesContainer.x = 0;
        this.pipesContainer.children.splice(0);
        this.playerInsidePipe = false;
        this.nextPipeFacing = this.firstPipeFacing;
        this.placedPipesCount = 0;
        this.container.addChild(this._createInitialPipes());
    },


    /**
     * Get the y position of the water
     */
    getWaterLevel: function getWaterLevel() {
        return settings.playableAreaAboveWater + utils.getTexture(settings.textures.CEILING).height;
    },
    pipeCollision: function pipeCollision(bird) {
        // Because of square collision it can feel unfair when hitting the sides of the pipes while at an angle
        // Which often happens when diving through the gap. To make things a bit fairer, added a small margin;
        var collisionMargin = settings.pipeCollisionSidesMargin;

        var left = this.pipesContainer.x + this.pipesContainer.children[0].x + collisionMargin;
        var right = left + utils.getTexture(settings.textures.PIPE).width - collisionMargin;

        // The bird is in the left/right boundaries of the first pipe
        if (bird.getRight() > left && bird.getLeft() < right) {
            this.playerInsidePipe = true;

            // The bird is above the gap!
            if (bird.getTop() < this.pipesContainer.children[0].gap.top - settings.pipeCollisionGapMargin || bird.getBottom() > this.pipesContainer.children[0].gap.bottom + settings.pipeCollisionGapMargin) {
                return true;
            }
        } else if (this.playerInsidePipe) {
            // Player has passed the pipe
            this._increaseScore();
            this.playerInsidePipe = false;
        }

        return false;
    },


    /**
     * Create the tiled ceiling sprite
     * @returns {PIXI.extras.TilingSprite}
     * @private
     */
    _createCeiling: function _createCeiling() {
        var ceilingTexture = utils.getTexture(settings.textures.CEILING);

        this.ceilingSprite = new PIXI.extras.TilingSprite(ceilingTexture, settings.gameWidth, ceilingTexture.height);

        return this.ceilingSprite;
    },


    /**
     * Create the tiled floor sprite
     * @returns {PIXI.extras.TilingSprite}
     * @private
     */
    _createFloor: function _createFloor() {
        var floorTexture = utils.getTexture(settings.textures.FLOOR);

        this.floorSprite = new PIXI.extras.TilingSprite(floorTexture, settings.gameWidth, floorTexture.height);
        this.floorSprite.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater + utils.getTexture(settings.textures.CEILING).height;

        return this.floorSprite;
    },


    /**
     * @returns {PIXI.Container}
     * @private
     */
    _createInitialPipes: function _createInitialPipes() {
        this.nextPipeFacing = this.firstPipeFacing;
        this.pipesContainer = new PIXI.Container();

        var startingPipesCount = Math.ceil(settings.gameWidth / settings.pipeDistance);

        for (var i = 0; i < startingPipesCount; i++) {
            this._placeNewPipe(i);
        }

        return this.pipesContainer;
    },


    /**
     * @returns {PIXI.Container}
     * @private
     */
    _createScoreContainer: function _createScoreContainer() {
        this.scoreContainer = new PIXI.Container();
        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));

        this.scoreContainer.x = settings.scorePosition.x;
        this.scoreContainer.y = utils.getTexture(settings.textures.CEILING).height + settings.scorePosition.y;

        return this.scoreContainer;
    },


    /**
     * Create a new pipe, the position depends on the number
     * @param number
     * @private
     */
    _placeNewPipe: function _placeNewPipe(number) {
        var height = number === 0 ? settings.firstPipeHeight : this._getRandomPipeHeight();

        var pipe = this._createPipe(height, this.nextPipeFacing);
        pipe.container.x = settings.firstPipeDistance + settings.pipeDistance * number;
        this.pipesContainer.addChild(pipe.container);

        this.nextPipeFacing *= -1;
        this.placedPipesCount++;
    },
    _createPipe: function _createPipe(height, direction) {
        return new Pipe(height, direction);
    },
    _increaseScore: function _increaseScore() {
        audioPlayer.play(audioPlayer.audioFragments.POINT);
        this.score++;

        if (this.score > this.bestScore) this.bestScore = this.score;

        // Because we put all digits inside one container, we only have to remove on child
        this.scoreContainer.removeChild(this.scoreContainer.children[0]);

        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));
    },


    /**
     * Get a random height for the pipe
     * @returns {number}
     * @private
     */
    _getRandomPipeHeight: function _getRandomPipeHeight() {
        return Math.random() * (settings.maxPipeHeight - settings.minPipeHeight) + settings.minPipeHeight;
    }
};

module.exports = level;

},{"./Pipe":2,"./audioPlayer":3,"./settings":9,"./utils.js":11}],9:[function(require,module,exports){
"use strict";

var settings = {
    /**
     * The location of the assets json
     */
    assetFile: "build/assets/spritesheet/spritesheet.json",

    soundsPath: "build/assets/sfx/",

    /**
     * The area that is available above the water
     */
    playableAreaAboveWater: 250,

    /**
     * The area that is available below the water
     */
    playableAreaBelowWater: 250,

    /**
     * The width of the game, filled during init currently
     */
    gameWidth: 0,

    /**
     * The speed at which objects move towards the player
     */
    forwardSpeed: 5,

    /**
     * The speed at which the background moves
     */
    backgroundSpeed: 2,

    /**
     * The amount of gravity added to the velocity of the player while above the water
     */
    gravity: 0.3,

    /**
     * The amount of upward force added to the velocity of the player while below the water
     */
    waterPushForce: 0.3,

    /**
     * The amount of upward velocity is added to the player on 'flapping'.
     */
    birdFlapVelocity: 4.5,

    /**
     * The speed of the bird animation
     */
    birdAnimationSpeed: 0.2,

    /**
     * Starting position of the bird
     */
    birdStartPosition: {
        x: 100,
        y: 150
    },

    /**
     * The vertical gaps in the pipes for the player to fly through
     */
    pipeGapSize: 100,

    /**
     * The distance to the first pipe
     */
    firstPipeDistance: 800,

    /**
     * The distance between each pipe
     */
    pipeDistance: 400,

    /**
     * The min height of a pipe (handle with care)
     */
    minPipeHeight: 275,

    /**
     * The max height of a pipe (handle with care)
     */
    maxPipeHeight: 375,

    /**
     * The height of the first pipe
     */
    firstPipeHeight: 320,

    pipeCollisionSidesMargin: 6,

    pipeCollisionGapMargin: 3,

    /**
     * The position of the score
     */
    scorePosition: {
        x: 10,
        y: 10 // Offset from the 'ceiling'
    },

    /**
     * If vertical velocity of the player should be reset before applying the flap velocity
     */
    shouldBirdFlapResetVelocity: true,

    textures: {
        'BACKGROUND': 'sky.png',
        'FLOOR': 'land.png',
        'CEILING': 'ceiling.png',
        'PIPE': 'pipe.png',
        'PIPE_UP': 'pipe-up.png',
        'PIPE_DOWN': 'pipe-down.png',
        'WATER': 'water.png',
        'GAME_OVER': 'scoreboard.png',
        'RESTART': 'replay.png',
        'BIG_0': 'font_big_0.png',
        'BIG_1': 'font_big_1.png',
        'BIG_2': 'font_big_2.png',
        'BIG_3': 'font_big_3.png',
        'BIG_4': 'font_big_4.png',
        'BIG_5': 'font_big_5.png',
        'BIG_6': 'font_big_6.png',
        'BIG_7': 'font_big_7.png',
        'BIG_8': 'font_big_8.png',
        'BIG_9': 'font_big_9.png',
        'SMALL_0': 'font_small_0.png',
        'SMALL_1': 'font_small_1.png',
        'SMALL_2': 'font_small_2.png',
        'SMALL_3': 'font_small_3.png',
        'SMALL_4': 'font_small_4.png',
        'SMALL_5': 'font_small_5.png',
        'SMALL_6': 'font_small_6.png',
        'SMALL_7': 'font_small_7.png',
        'SMALL_8': 'font_small_8.png',
        'SMALL_9': 'font_small_9.png'
    },

    init: function init() {
        this.gameWidth = window.innerWidth;
    }
};

settings.init();

module.exports = settings;

},{}],10:[function(require,module,exports){
"use strict";

var settings = require('./settings');

var setup = {
    /**
     * Set up the renderer
     * @returns {PIXI.WebGLRenderer|PIXI.CanvasRenderer}
     */
    renderer: function renderer() {
        var renderer = PIXI.autoDetectRenderer(settings.gameWidth, window.innerHeight);
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.backgroundColor = 0x4ec0ca;
        renderer.autoResize = true;

        document.body.appendChild(renderer.view);

        return renderer;
    },


    /**
     * Load the assets
     * @param callback action to perform after assets have been loaded
     */
    loadAssets: function loadAssets(callback) {
        if (typeof callback !== 'function') throw new Error('Callback must be a function');

        PIXI.loader.add(settings.assetFile).load(callback);
    }
};

module.exports = setup;

},{"./settings":9}],11:[function(require,module,exports){
'use strict';

var settings = require('./settings');

var utils = {

    scoreSize: {
        'SMALL': 0,
        'BIG': 1
    },

    /**
     * Get a texture from the pixi loader by name
     * @param name texture name, with extension
     * @returns {*|PIXI.Texture|FrameObject}
     */
    getTexture: function getTexture(name) {
        return PIXI.loader.resources[settings.assetFile].textures[name];
    },


    /**
     * Generate score sprites based on passed score
     * @param score
     * @param size
     * @returns {Container|*}
     */
    scoreToSprites: function scoreToSprites(score, size) {
        var stringScore = score.toString();

        var texturePrefix = size === this.scoreSize.BIG ? 'BIG_' : 'SMALL_';
        var letterSpacing = size === this.scoreSize.BIG ? 25 : 10;

        var digitsContainer = new PIXI.Container();

        for (var i = 0, len = stringScore.length; i < len; i++) {
            var digit = new PIXI.Sprite(this.getTexture(settings.textures[texturePrefix + stringScore.charAt(i)]));
            digit.x = i * letterSpacing;
            digitsContainer.addChild(digit);
        }

        return digitsContainer;
    }
};

module.exports = utils;

},{"./settings":9}]},{},[1])

//# sourceMappingURL=bundle.js.map
