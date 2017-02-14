let settings = require('./settings');
let utils = require('./utils.js');

let audioPlayer = require('./audioPlayer');

const pipeFacing = {
    'UP': 1,
    'DOWN': -1,
};

let level = {
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

    initialize() {
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

        return this.container;
    },

    reset() {
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

    loop() {
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
    getWaterLevel() {
        return settings.playableAreaAboveWater;
    },

    pipeCollision(bird) {

        // We will check if the bird is colliding with the first pipe
        // The bird can't possibly hit any other pipes

        // We only need to collide with the left side of the pipes and the top/bottom pieces
        // We know how far the pipe container has moved to the right, we can use this to get the left side

        // Because of square collision it can feel unfair when hitting the sides of the pipes while at an angle
        // Which often happens when diving through the gap. To make things a bit fairer, added a small margin;
        let collisionMargin = 2;

        let left = this.pipesContainer.x + this.pipes[0].x + collisionMargin;
        let right = left + utils.getTexture(settings.textures.pipe).width - collisionMargin;
        
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

    _createCeiling() {
        let ceilingTexture = utils.getTexture(settings.textures.ceiling);

        this.ceilingSprite = new PIXI.extras.TilingSprite(ceilingTexture, settings.gameWidth, ceilingTexture.height);

        return this.ceilingSprite;
    },

    _createFloor() {
        let floorTexture = utils.getTexture(settings.textures.floor);

        this.floorSprite = new PIXI.extras.TilingSprite(floorTexture, settings.gameWidth, floorTexture.height);
        this.floorSprite.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater + utils.getTexture(settings.textures.ceiling).height;

        return this.floorSprite;
    },

    _initialPipes() {
        let startingPipesCount = Math.ceil(settings.gameWidth / this.pipeDistance);

        for (let i = 0; i < startingPipesCount; i++) {
            let pipe = this._createPipe(this._getRandomPipeHeight(), this.nextPipeFacing);
            pipe.x = this.firstPipeDistance + this.pipeDistance * i;
            this.pipesContainer.addChild(pipe);
            this.pipes.push(pipe);

            this.nextPipeFacing *= -1;
            this.placedPipesCount++;
        }
    },

    _placeNewPipe() {
        // We need total pipe amount, to calculate position of new one
        let pipe = this._createPipe(this._getRandomPipeHeight(), this.nextPipeFacing);
        pipe.x = this.placedPipesCount * this.pipeDistance + this.firstPipeDistance;
        this.pipesContainer.addChild(pipe);
        this.pipes.push(pipe);

        this.nextPipeFacing *= -1;
        this.placedPipesCount++;
    },

    _createPipe(height, direction) {
        let container = new PIXI.Container();

        let totalPlayHeight = settings.playableAreaAboveWater + settings.playableAreaBelowWater;

        if (direction === pipeFacing.UP) {
            container.addChild(this._createUpFacingPipe(height));
        } else if (direction === pipeFacing.DOWN) {
            container.addChild(this._createDownFacingPipe(height));
        }

        // Check if we have space for pipe in opposite direction to complete the gap
        if (height + this.pipeGapSize < totalPlayHeight) {
            // We can fit another pipe opposite to it
            let oppositePipeHeight = totalPlayHeight - height - this.pipeGapSize;
            if (direction === pipeFacing.UP)
                container.addChild(this._createDownFacingPipe(oppositePipeHeight));

            if (direction === pipeFacing.DOWN)
                container.addChild(this._createUpFacingPipe(oppositePipeHeight));
        }

        // Store the information of the gap position in the container object for easier collision checks
        let top = (direction === pipeFacing.UP ? totalPlayHeight - height - this.pipeGapSize : height) + this.ceilingSprite.height;
        let bottom = (direction === pipeFacing.UP ? totalPlayHeight - height : height + this.pipeGapSize) + this.ceilingSprite.height;
        container.gap = { top, bottom }

        return container;
    },

    _createUpFacingPipe(height) {
        let container = new PIXI.Container();

        let pipeTop = new PIXI.Sprite(this.pipeTopTexture);
        container.addChild(pipeTop);

        let pipePartHeight = height - this.pipeTopTexture.height;

        let pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
        pipe.y = this.pipeTopTexture.height;
        container.addChild(pipe);

        // Place pipe on the bottom
        container.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater - height + utils.getTexture(settings.textures.ceiling).height;

        return container;
    },

    _createDownFacingPipe(height) {
        let container = new PIXI.Container();

        let pipePartHeight = height - this.pipeBottomTexture.height;

        let pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
        container.addChild(pipe);

        let pipeBottom = new PIXI.Sprite(this.pipeBottomTexture);
        pipeBottom.y = pipePartHeight;
        container.addChild(pipeBottom);

        // We can place it against the ceiling
        container.y = utils.getTexture(settings.textures.ceiling).height;

        return container;
    },

    _increaseScore() {
        audioPlayer.play(audioPlayer.audioFragments.POINT);
        this.score++;

        if (this.score > this.bestScore) this.bestScore = this.score;

        // Because we put all digits inside one container, we only have to remove on child
        this.scoreContainer.removeChild(this.scoreContainer.children[0]);

        this.scoreContainer.addChild(utils.scoreToSprites(this.score, utils.scoreSize.BIG));
   },

    _getRandomPipeHeight() {
        // Todo: Grab from settings somewhere
        let minHeight = 280;
        let maxHeight = 390;

        return Math.random() * (maxHeight - minHeight) + minHeight;
    },
};

module.exports = level;
