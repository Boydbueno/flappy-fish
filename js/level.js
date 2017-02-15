let settings = require('./settings');
let utils = require('./utils.js');

let audioPlayer = require('./audioPlayer');

let Pipe = require('./Pipe');

let level = {
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

    initialize() {
        this.container = new PIXI.Container();

        this.container.addChild(this._createCeiling());
        this.container.addChild(this._createFloor());

        this.container.addChild(this._createInitialPipes());

        this.container.addChild(this._createScoreContainer());

        return this.container;
    },

    loop() {
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
    reset() {
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
    getWaterLevel() {
        return settings.playableAreaAboveWater;
    },

    pipeCollision(bird) {
        // Because of square collision it can feel unfair when hitting the sides of the pipes while at an angle
        // Which often happens when diving through the gap. To make things a bit fairer, added a small margin;
        let collisionMargin = settings.pipeCollisionSidesMargin;

        let left = this.pipesContainer.x + this.pipesContainer.children[0].x + collisionMargin;
        let right = left + utils.getTexture(settings.textures.PIPE).width - collisionMargin;
        
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
    _createCeiling() {
        let ceilingTexture = utils.getTexture(settings.textures.CEILING);

        this.ceilingSprite = new PIXI.extras.TilingSprite(ceilingTexture, settings.gameWidth, ceilingTexture.height);

        return this.ceilingSprite;
    },

    /**
     * Create the tiled floor sprite
     * @returns {PIXI.extras.TilingSprite}
     * @private
     */
    _createFloor() {
        let floorTexture = utils.getTexture(settings.textures.FLOOR);

        this.floorSprite = new PIXI.extras.TilingSprite(floorTexture, settings.gameWidth, floorTexture.height);
        this.floorSprite.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater + utils.getTexture(settings.textures.CEILING).height;

        return this.floorSprite;
    },

    /**
     * @returns {PIXI.Container}
     * @private
     */
    _createInitialPipes() {
        this.nextPipeFacing = this.firstPipeFacing;
        this.pipesContainer = new PIXI.Container();

        let startingPipesCount = Math.ceil(settings.gameWidth / settings.pipeDistance);

        for (let i = 0; i < startingPipesCount; i++) {
            this._placeNewPipe(i);
        }

        return this.pipesContainer;
    },

    /**
     * @returns {PIXI.Container}
     * @private
     */
    _createScoreContainer() {
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
    _placeNewPipe(number) {
        // We need total pipe amount, to calculate position of new one
        let pipe = this._createPipe(this._getRandomPipeHeight(), this.nextPipeFacing);
        pipe.container.x = settings.firstPipeDistance + settings.pipeDistance * number;
        this.pipesContainer.addChild(pipe.container);

        this.nextPipeFacing *= -1;
        this.placedPipesCount++;
    },

    _createPipe(height, direction) {
        return new Pipe(height, direction);
    },

    _increaseScore() {
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
    _getRandomPipeHeight() {
        return Math.random() * (settings.maxPipeHeight - settings.minPipeHeight) + settings.minPipeHeight;
    },
};

module.exports = level;
