(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function () {
    var game = require('./game');
    game.start();
})();

},{"./game":5}],2:[function(require,module,exports){
'use strict';

var settings = require('./settings');

var audioPlayer = {

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
            this._audio[this.audioFragments[key]] = new Audio(settings.soundsPath + this.audioFragments[key]);
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

},{"./settings":7}],3:[function(require,module,exports){
'use strict';

var settings = require('./settings.js');
var utils = require('./utils.js');

var background = {
    /**
     * The container that will contain all background tiles lined up
     */
    backgroundSprite: undefined,

    /**
     * The width of one background tile, is needed in some calculations/checks
     */
    skyTileWidth: 0,

    initialize: function initialize() {
        var skyTileTexture = utils.getTexture(settings.textures.background);
        this.backgroundSprite = new PIXI.extras.TilingSprite(skyTileTexture, window.innerWidth, skyTileTexture.height);
        this.backgroundSprite.y = settings.playableAreaAboveWater - skyTileTexture.height + utils.getTexture(settings.textures.ceiling).height;

        return this;
    },
    loop: function loop() {
        this.backgroundSprite.tilePosition.x += -settings.backgroundSpeed;
    },


    /**
     * Get the element that needs to be rendered
     * @returns {Container}
     */
    getElement: function getElement() {
        return this.backgroundSprite;
    }
};

module.exports = background;

},{"./settings.js":7,"./utils.js":9}],4:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils');

var audioPlayer = require('./audioPlayer');

var bird = {
    container: undefined,
    bird: undefined,
    boundingBox: undefined,
    velocity: { x: 0, y: 0 },
    isBelowWater: false,

    animationFrames: 4,

    initialize: function initialize() {
        this.container = new PIXI.Container();

        var spriteFrames = [];
        for (var i = 0; i < this.animationFrames; i++) {
            spriteFrames.push(utils.getTexture('bird_' + i + '.png'));
        }
        this.bird = new PIXI.extras.AnimatedSprite(spriteFrames);

        this.bird.animationSpeed = 0.2;
        this.bird.play();

        this.bird.anchor.x = 0.5;
        this.bird.anchor.y = 0.5;

        this.bird.y = 150;
        this.bird.x = 100;

        this.container.addChild(this.bird);

        this.boundingBox = { x: 0, y: 0, width: 0, height: 0 };

        return this;
    },
    loop: function loop() {
        if (this.isBelowWater) {
            this.belowWater();
        } else {
            this.aboveWater();
        }

        this.bird.y += this.velocity.y;
        this.bird.rotation = Math.atan2(this.velocity.y, settings.forwardSpeed);
    },
    aboveWater: function aboveWater() {
        this.velocity.y += settings.gravity;
    },
    belowWater: function belowWater() {
        this.velocity.y -= settings.waterPushForce;
    },
    flap: function flap() {
        if (settings.shouldBirdFlapResetVelocity) {
            this.velocity.y = 0;
        }

        if (this.isBelowWater) {
            this._swim();
        } else {
            this._flap();
        }
    },
    reset: function reset() {
        this.bird.y = 150;
        this.bird.x = 100;
        this.velocity.x = 0;
        this.velocity.y = 0;
    },
    getElement: function getElement() {
        return this.bird;
    },
    getTop: function getTop() {
        return this.bird.y - this.bird.height / 2;
    },
    getBottom: function getBottom() {
        return this.bird.y + this.bird.height / 2;
    },
    getRight: function getRight() {
        return this.bird.x + this.bird.width / 2;
    },
    getLeft: function getLeft() {
        return this.bird.x - this.bird.width / 2;
    },
    enterWater: function enterWater() {
        if (this.isBelowWater) return;
        this.isBelowWater = true;

        audioPlayer.play(audioPlayer.audioFragments.ENTER_WATER);
    },
    leaveWater: function leaveWater() {
        if (!this.isBelowWater) return;
        this.isBelowWater = false;

        audioPlayer.play(audioPlayer.audioFragments.EXIT_WATER);
    },
    _flap: function _flap() {
        audioPlayer.play(audioPlayer.audioFragments.FLAP);

        this.velocity.y -= settings.birdFlapVelocity;
    },
    _swim: function _swim() {
        audioPlayer.play(audioPlayer.audioFragments.SWIM);

        this.velocity.y += settings.birdFlapVelocity;
    }
};

module.exports = bird;

},{"./audioPlayer":2,"./settings":7,"./utils":9}],5:[function(require,module,exports){
'use strict';

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var setup = require('./setup');
var background = require('./background');
var level = require('./level');
var bird = require('./bird');

var audioPlayer = require('./audioPlayer');
var settings = require('./settings');


var game = {

    renderer: undefined,
    stage: undefined,
    gameOverContainer: undefined,

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
        var _this = this;

        this.stage = new PIXI.Container();

        background.initialize();
        this.stage.addChild(background.getElement());

        level.initialize();
        this.stage.addChild(level.getElement());

        bird.initialize();
        this.stage.addChild(bird.getElement());

        // Render the water
        var waterTexture = utils.getTexture(settings.textures.WATER);
        var waterSprite = new PIXI.extras.TilingSprite(waterTexture, window.innerWidth, settings.playableAreaBelowWater);
        waterSprite.y = utils.getTexture(settings.textures.ceiling).height + settings.playableAreaAboveWater;
        this.stage.addChild(waterSprite);

        this.stage.addChild(this._createGameOverScreen());

        this.renderer.render(this.stage);

        // Todo: Add proper input handling
        window.addEventListener("keyup", function (e) {
            if (e.keyCode != 32) return; // Not spacebar
            if (_this.hasStopped) {
                _this._clickRestart();
            } else {
                bird.flap();
            }
        }, false);

        if ("ontouchstart" in window) window.addEventListener("touchstart", function () {
            if (_this.hasStopped) return;
            bird.flap();
        });else window.addEventListener("mousedown", function () {
            if (_this.hasStopped) return;
            bird.flap();
        });

        this.loop();
    },


    /**
     * The game loop
     */
    loop: function loop() {
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
    gameOver: function gameOver() {
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
    _createGameOverScreen: function _createGameOverScreen() {
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

        var restartButton = new PIXI.Sprite(utils.getTexture(settings.textures.RESTART));
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
    _clickRestart: function _clickRestart() {
        this.restart();
        this.gameOverContainer.visible = false;
    },


    /**
     * Stop the game
     */
    stop: function stop() {
        this.hasStopped = true;
    },


    /**
     * Continue the game after stopping
     * Make sure bird is no longer colliding or it'll stop again instantly
     */
    restart: function restart() {
        level.reset();
        bird.reset();

        this.hasStopped = false;
    },
    _playDieAudio: function _playDieAudio() {
        audioPlayer.play(audioPlayer.audioFragments.HIT, audioPlayer.play.bind(audioPlayer, audioPlayer.audioFragments.DIE));
    }
};

module.exports = game;

},{"./audioPlayer":2,"./background":3,"./bird":4,"./level":6,"./settings":7,"./setup":8,"./utils":9}],6:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils.js');

var audioPlayer = require('./audioPlayer');

var pipeFacing = {
    'UP': 1,
    'DOWN': -1
};

var level = {
    /**
     * The container that will contain everything that needs to be moved towards the player
     */
    container: undefined,
    /**
     * The container that will contain all floor tiles
     */
    floorSprite: undefined,

    ceilingSprite: undefined,

    pipesContainer: undefined,
    pipes: [],

    pipeTexture: undefined,
    pipeTopTexture: undefined,
    pipeBottomTexture: undefined,

    firstPipeFacing: pipeFacing.UP,

    nextPipeFacing: 0,
    placedPipesCount: 0,

    playerInsidePipe: false,

    pipeGapSize: 100,

    pipeDistance: 400,
    firstPipeDistance: 800,

    score: 0,
    bestScore: 0,
    scoreContainer: undefined,

    initialize: function initialize() {
        this.container = new PIXI.Container();

        this.container.addChild(this._createCeiling());
        this.container.addChild(this._createFloor());

        // Pipes stuff
        this.nextPipeFacing = this.firstPipeFacing;
        this.pipeTexture = utils.getTexture(settings.textures.pipe);
        this.pipeTopTexture = utils.getTexture(settings.textures.pipeUp);
        this.pipeBottomTexture = utils.getTexture(settings.textures.pipeDown);

        this.pipesContainer = new PIXI.Container();

        this._initialPipes();

        this.container.addChild(this.pipesContainer);

        // Score
        this.scoreContainer = new PIXI.Container();
        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));

        // Todo: Make vars
        this.scoreContainer.x = 10;
        this.scoreContainer.y = utils.getTexture(settings.textures.ceiling).height + 10;

        this.container.addChild(this.scoreContainer);

        return this;
    },
    reset: function reset() {
        this.score = 0;
        this.scoreContainer.removeChild(this.scoreContainer.children[0]);
        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));

        this.pipesContainer.x = 0;
        this.pipesContainer.children.splice(0);
        this.pipes = [];
        this.playerInsidePipe = false;
        this.nextPipeFacing = this.firstPipeFacing;
        this.placedPipesCount = 0;
        this._initialPipes();
    },
    loop: function loop() {
        this.ceilingSprite.tilePosition.x += -settings.forwardSpeed;
        this.floorSprite.tilePosition.x += -settings.forwardSpeed;

        // Pipes stuff
        this.pipesContainer.x += -settings.forwardSpeed;

        // Remove pipes when they're off screen
        if (this.pipes.length > 0) {

            if (this.pipesContainer.x < -this.pipes[0].x - this.pipeTexture.width) {
                this.pipesContainer.removeChild(this.pipes[0]);
                this.pipes.shift();

                this._placeNewPipe();
            }
        }
    },


    /**
     * Get the y position of the water
     */
    getWaterLevel: function getWaterLevel() {
        return settings.playableAreaAboveWater;
    },


    /**
     * Get the element to render
     * @returns {undefined|*}
     */
    getElement: function getElement() {
        return this.container;
    },
    pipeCollision: function pipeCollision(bird) {

        // We will check if the bird is colliding with the first pipe
        // The bird can't possibly hit any other pipes

        // We only need to collide with the left side of the pipes and the top/bottom pieces
        // We know how far the pipe container has moved to the right, we can use this to get the left side

        // Because of square collision it can feel unfair when hitting the sides of the pipes while at an angle
        // Which often happens when diving through the gap. To make things a bit fairer, added a small margin;
        var collisionMargin = 2;

        var left = this.pipesContainer.x + this.pipes[0].x + collisionMargin;
        var right = left + utils.getTexture(settings.textures.pipe).width - collisionMargin;

        // The bird is in the left/right boundaries of the first pipe
        if (bird.getRight() > left && bird.getLeft() < right) {

            this.playerInsidePipe = true;

            // The bird is above the gap!
            if (bird.getTop() < this.pipes[0].gap.top || bird.getBottom() > this.pipes[0].gap.bottom) {
                return true;
            }
        } else if (this.playerInsidePipe) {
            // Player has passed the pipe
            this._increaseScore();
            this.playerInsidePipe = false;
        }

        return false;
    },
    _createCeiling: function _createCeiling() {
        var ceilingTexture = utils.getTexture(settings.textures.ceiling);

        this.ceilingSprite = new PIXI.extras.TilingSprite(ceilingTexture, window.innerWidth, ceilingTexture.height);

        return this.ceilingSprite;
    },
    _createFloor: function _createFloor() {
        var floorTexture = utils.getTexture(settings.textures.floor);

        this.floorSprite = new PIXI.extras.TilingSprite(floorTexture, window.innerWidth, floorTexture.height);
        this.floorSprite.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater + utils.getTexture(settings.textures.ceiling).height;

        return this.floorSprite;
    },
    _initialPipes: function _initialPipes() {
        var startingPipesCount = Math.ceil(window.innerWidth / this.pipeDistance);

        for (var i = 0; i < startingPipesCount; i++) {
            var pipe = this._createPipe(this._getRandomPipeHeight(), this.nextPipeFacing);
            pipe.x = this.firstPipeDistance + this.pipeDistance * i;
            this.pipesContainer.addChild(pipe);
            this.pipes.push(pipe);

            this.nextPipeFacing *= -1;
            this.placedPipesCount++;
        }
    },
    _placeNewPipe: function _placeNewPipe() {
        // We need total pipe amount, to calculate position of new one
        var pipe = this._createPipe(this._getRandomPipeHeight(), this.nextPipeFacing);
        pipe.x = this.placedPipesCount * this.pipeDistance + this.firstPipeDistance;
        this.pipesContainer.addChild(pipe);
        this.pipes.push(pipe);

        this.nextPipeFacing *= -1;
        this.placedPipesCount++;
    },
    _createPipe: function _createPipe(height, direction) {
        var container = new PIXI.Container();

        var totalPlayHeight = settings.playableAreaAboveWater + settings.playableAreaBelowWater;

        if (direction === pipeFacing.UP) {
            container.addChild(this._createUpFacingPipe(height));
        } else if (direction === pipeFacing.DOWN) {
            container.addChild(this._createDownFacingPipe(height));
        }

        // Check if we have space for pipe in opposite direction to complete the gap
        if (height + this.pipeGapSize < totalPlayHeight) {
            // We can fit another pipe opposite to it
            var oppositePipeHeight = totalPlayHeight - height - this.pipeGapSize;
            if (direction === pipeFacing.UP) container.addChild(this._createDownFacingPipe(oppositePipeHeight));

            if (direction === pipeFacing.DOWN) container.addChild(this._createUpFacingPipe(oppositePipeHeight));
        }

        // Store the information of the gap position in the container object for easier collision checks
        var top = (direction === pipeFacing.UP ? totalPlayHeight - height - this.pipeGapSize : height) + this.ceilingSprite.height;
        var bottom = (direction === pipeFacing.UP ? totalPlayHeight - height : height + this.pipeGapSize) + this.ceilingSprite.height;
        container.gap = { top: top, bottom: bottom };

        return container;
    },
    _createUpFacingPipe: function _createUpFacingPipe(height) {
        var container = new PIXI.Container();

        var pipeTop = new PIXI.Sprite(this.pipeTopTexture);
        container.addChild(pipeTop);

        var pipePartHeight = height - this.pipeTopTexture.height;

        var pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
        pipe.y = this.pipeTopTexture.height;
        container.addChild(pipe);

        // Place pipe on the bottom
        container.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater - height + utils.getTexture(settings.textures.ceiling).height;

        return container;
    },
    _createDownFacingPipe: function _createDownFacingPipe(height) {
        var container = new PIXI.Container();

        var pipePartHeight = height - this.pipeBottomTexture.height;

        var pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
        container.addChild(pipe);

        var pipeBottom = new PIXI.Sprite(this.pipeBottomTexture);
        pipeBottom.y = pipePartHeight;
        container.addChild(pipeBottom);

        // We can place it against the ceiling
        container.y = utils.getTexture(settings.textures.ceiling).height;

        return container;
    },
    _increaseScore: function _increaseScore() {
        audioPlayer.play(audioPlayer.audioFragments.POINT);
        this.score++;

        if (this.score > this.bestScore) this.bestScore = this.score;

        // Because we put all digits inside one container, we only have to remove on child
        this.scoreContainer.removeChild(this.scoreContainer.children[0]);

        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));
    },
    _getRandomPipeHeight: function _getRandomPipeHeight() {
        // Todo: Grab from settings somewhere
        var minHeight = 280;
        var maxHeight = 390;

        return Math.random() * (maxHeight - minHeight) + minHeight;
    }
};

module.exports = level;

},{"./audioPlayer":2,"./settings":7,"./utils.js":9}],7:[function(require,module,exports){
"use strict";

var settings = {
    /**
     * The location of the assets json
     */
    assetFile: "assets/assets.json",

    soundsPath: "assets/sounds/",

    /**
     * The area that is available above the water
     */
    playableAreaAboveWater: 260,

    playableAreaBelowWater: 260,

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
     * If vertical velocity of the player should be reset before applying the flap velocity
     */
    shouldBirdFlapResetVelocity: true,

    textures: {
        'background': 'sky.png',
        'floor': 'land.png',
        'ceiling': 'ceiling.png',
        'pipe': 'pipe.png',
        'pipeUp': 'pipe-up.png',
        'pipeDown': 'pipe-down.png',
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
    }
};

module.exports = settings;

},{}],8:[function(require,module,exports){
"use strict";

var setup = {
    renderer: function renderer() {
        var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.backgroundColor = 0x4ec0ca;
        renderer.autoResize = true;

        document.body.appendChild(renderer.view);

        return renderer;
    },
    loadAssets: function loadAssets(callback) {
        PIXI.loader.add("assets/assets.json").load(callback);
    }
};

module.exports = setup;

},{}],9:[function(require,module,exports){
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
     * Fill a given pixi container and fill it with vertically aligned tiles fitting whole window width
     * @param container
     * @param texture
     */
    fillContainerWithWindowWidthTiles: function fillContainerWithWindowWidthTiles(container, texture) {
        var requiredTiles = this._getRequiredWidthTiles(texture.width);

        for (var i = 0; i < requiredTiles; i++) {
            var tile = new PIXI.Sprite(texture);
            tile.x = tile.width * i;
            container.addChild(tile);
        }
    },
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
    },
    _getRequiredWidthTiles: function _getRequiredWidthTiles(tileWidth) {
        return Math.ceil(window.innerWidth / tileWidth) + 1;
    }
};

module.exports = utils;

},{"./settings":7}]},{},[1])

//# sourceMappingURL=bundle.js.map
