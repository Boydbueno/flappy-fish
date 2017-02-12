(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function () {
    var game = require('./game');
    game.start();
})();

},{"./game":4}],2:[function(require,module,exports){
'use strict';

var settings = require('./settings.js');
var utils = require('./utils.js');

var background = {
    /**
     * The container that will contain all background tiles lined up
     */
    container: undefined,

    /**
     * The width of one background tile, is needed in some calculations/checks
     */
    skyTileWidth: 0,

    initialize: function initialize() {
        this.container = new PIXI.Container();
        var skyTileTexture = utils.getTexture(settings.textures.background);
        this.skyTileWidth = skyTileTexture.width;

        this.container.y = settings.playableAreaAboveWater - skyTileTexture.height + utils.getTexture(settings.textures.ceiling).height;

        utils.fillContainerWithWindowWidthTiles(this.container, skyTileTexture);

        return this;
    },
    loop: function loop() {
        this.container.x += -settings.backgroundSpeed;

        // By moving the whole background back at the right moment we don't have to worry about tracking individual tiles
        if (this.container.x <= -this.skyTileWidth) {
            this.container.x = 0;
        }
    },


    /**
     * Get the element that needs to be rendered
     * @returns {Container}
     */
    getElement: function getElement() {
        return this.container;
    }
};

module.exports = background;

},{"./settings.js":6,"./utils.js":8}],3:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils');

var bird = {
    container: undefined,
    bird: undefined,
    boundingBox: undefined,
    velocity: { x: 0, y: 0 },
    isBelowWater: true,

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

        this.velocity.y -= settings.birdFlapVelocity;
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
    }
};

module.exports = bird;

},{"./settings":6,"./utils":8}],4:[function(require,module,exports){
'use strict';

var setup = require('./setup');
var background = require('./background');
var level = require('./level');
var bird = require('./bird');

var game = {

    renderer: undefined,
    stage: undefined,

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

        background.initialize();
        this.stage.addChild(background.getElement());

        level.initialize();
        this.stage.addChild(level.getElement());

        // Spawn the pipes

        bird.initialize();
        this.stage.addChild(bird.getElement());

        this.renderer.render(this.stage);

        // Todo: Add proper input handling
        window.addEventListener("keyup", bird.flap.bind(bird), false);

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
            bird.isBelowWater = false;
        } else if (bird.getTop() >= level.getWaterLevel() && !bird.isBelowWater) {
            bird.isBelowWater = true;
        }

        // Ceiling collision
        if (bird.getTop() <= level.ceilingSprite.y + level.ceilingSprite.height) {
            this.stop();
        }

        if (level.pipeCollision(bird)) {
            this.stop();
        }

        this.renderer.render(this.stage);
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
    play: function play() {
        this.hasStopped = false;
    }
};

module.exports = game;

},{"./background":2,"./bird":3,"./level":5,"./setup":7}],5:[function(require,module,exports){
'use strict';

var settings = require('./settings');
var utils = require('./utils.js');

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

    pipeGapSize: 100,

    pipeDistance: 300,
    firstPipeDistance: 800,

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

        return this;
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

        var left = this.pipesContainer.x + this.pipes[0].x;
        var right = left + utils.getTexture(settings.textures.pipe).width;

        // The bird is in the left/right boundaries of the first pipe
        if (bird.getRight() > left && bird.getLeft() < right) {

            // The bird is above the gap!
            if (bird.getTop() < this.pipes[0].gap.top || bird.getBottom() > this.pipes[0].gap.bottom) {
                return true;
            }
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
        var top = (direction === pipeFacing.UP ? height - this.pipeGapSize : height) + this.ceilingSprite.height;
        var bottom = (direction === pipeFacing.UP ? height : height + this.pipeGapSize) + this.ceilingSprite.height;
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
    _getRandomPipeHeight: function _getRandomPipeHeight() {
        return 280;
    }
};

module.exports = level;

},{"./settings":6,"./utils.js":8}],6:[function(require,module,exports){
'use strict';

var settings = {
    /**
     * The location of the assets json
     */
    assetFile: "assets/assets.json",

    /**
     * The area that is available above the water
     */
    playableAreaAboveWater: 280,

    playableAreaBelowWater: 280,

    /**
     * The speed at which objects move towards the player
     */
    forwardSpeed: 5,

    /**
     * The speed at which the background moves
     */
    backgroundSpeed: 1,

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
    birdFlapVelocity: 4,

    /**
     * If vertical velocity of the player should be reset before applying the flap velocity
     */
    shouldBirdFlapResetVelocity: false,

    textures: {
        'background': 'sky.png',
        'floor': 'land.png',
        'ceiling': 'ceiling.png',
        'pipe': 'pipe.png',
        'pipeUp': 'pipe-up.png',
        'pipeDown': 'pipe-down.png'
    }
};

module.exports = settings;

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

var settings = require('./settings');

var utils = {

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
    _getRequiredWidthTiles: function _getRequiredWidthTiles(tileWidth) {
        return Math.ceil(window.innerWidth / tileWidth) + 1;
    }
};

module.exports = utils;

},{"./settings":6}]},{},[1])

//# sourceMappingURL=bundle.js.map
