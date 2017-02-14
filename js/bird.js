let settings = require('./settings');
let utils = require('./utils');

let audioPlayer = require('./audioPlayer');

let bird = {
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

    initialize() {
        this.sprite = this._setupBirdSprite();
        return this.sprite;
    },

    loop() {
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
    flap() {
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
    reset() {
        this.sprite.x = settings.birdStartPosition.x;
        this.sprite.y = settings.birdStartPosition.y;
        this.velocity = 0;
    },

    /**
     * Simple helper function to get the top position of the bird
     * @returns {number}
     */
    getTop() {
        return this.sprite.y - this.sprite.height / 2;
    },

    /**
     * Simple helper function to get the bottom position of the bird
     * @returns {number}
     */
    getBottom() {
        return this.sprite.y + this.sprite.height / 2;
    },

    /**
     * Simple helper function to get the right position of the bird
     * @returns {number}
     */
    getRight() {
        return this.sprite.x + this.sprite.width / 2;
    },

    /**
     * Simple helper function to get the left position of the bird
     * @returns {number}
     */
    getLeft() {
        return this.sprite.x - this.sprite.width / 2;
    },

    /**
     * When the bird enters the water
     */
    enterWater() {
        if (this.isBelowWater) return;
        this.isBelowWater = true;

        audioPlayer.play(audioPlayer.audioFragments.ENTER_WATER);
    },

    /**
     * When the bird leaves the water
     */
    leaveWater() {
        if (!this.isBelowWater) return;
        this.isBelowWater = false;

        audioPlayer.play(audioPlayer.audioFragments.EXIT_WATER);
    },

    /**
     * Setup the bird sprite with its animations
     * @returns {AnimatedSprite|*}
     * @private
     */
    _setupBirdSprite() {
        let spriteFrames = [];
        for (let i = 0; i < this.animationFrames; i++) {
            spriteFrames.push(utils.getTexture(this.birdTextureNamePrefix + i +  this.birdTextureNameSuffix));
        }

        let sprite = new PIXI.extras.AnimatedSprite(spriteFrames);

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
    _flap() {
        audioPlayer.play(audioPlayer.audioFragments.FLAP);

        this.velocity -= settings.birdFlapVelocity;
    },

    /**
     * The below water flap (aka swim) behaviour
     * @private
     */
    _swim() {
        audioPlayer.play(audioPlayer.audioFragments.SWIM);

        this.velocity += settings.birdFlapVelocity;
    }
};

module.exports = bird;
