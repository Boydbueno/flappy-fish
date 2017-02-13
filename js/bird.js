let settings = require('./settings');
let utils = require('./utils');

let audioPlayer = require('./audioPlayer');

let bird = {
    container: undefined,
    bird: undefined,
    boundingBox: undefined,
    velocity: {x: 0, y: 0},
    isBelowWater: false,

    animationFrames: 4,

    initialize() {
        this.container = new PIXI.Container();

        let spriteFrames = [];
        for (let i = 0; i < this.animationFrames; i++) {
            spriteFrames.push(utils.getTexture('bird_' + i +  '.png'));
        }
        this.bird = new PIXI.extras.AnimatedSprite(spriteFrames);

        this.bird.animationSpeed = 0.2;
        this.bird.play();

        this.bird.anchor.x = 0.5;
        this.bird.anchor.y = 0.5;

        this.bird.y = 150;
        this.bird.x = 100;

        this.container.addChild(this.bird);

        this.boundingBox = {x: 0, y: 0, width: 0, height: 0};

        return this;
    },

    loop() {
        if (this.isBelowWater) {
            this.belowWater();
        } else {
            this.aboveWater();
        }

        this.bird.y += this.velocity.y;
        this.bird.rotation = Math.atan2(this.velocity.y, settings.forwardSpeed);
    },

    aboveWater() {
        this.velocity.y += settings.gravity;
    },

    belowWater() {
        this.velocity.y -= settings.waterPushForce;
    },

    flap() {
        if (settings.shouldBirdFlapResetVelocity ) {
            this.velocity.y = 0;
        }

        if (this.isBelowWater) {
            this._swim();
        } else {
            this._flap();
        }
    },

    reset() {
        this.bird.y = 150;
        this.bird.x = 100;
        this.velocity.x = 0;
        this.velocity.y = 0;
    },

    getElement() {
        return this.bird;
    },

    getTop() {
        return this.bird.y - this.bird.height / 2;
    },

    getBottom() {
        return this.bird.y + this.bird.height / 2;
    },

    getRight() {
        return this.bird.x + this.bird.width / 2;
    },

    getLeft() {
        return this.bird.x - this.bird.width / 2;
    },

    enterWater() {
        if (this.isBelowWater) return;
        this.isBelowWater = true;

        audioPlayer.play(audioPlayer.audioFragments.ENTER_WATER);
    },

    leaveWater() {
        if (!this.isBelowWater) return;
        this.isBelowWater = false;

        audioPlayer.play(audioPlayer.audioFragments.EXIT_WATER);
    },

    _flap() {
        audioPlayer.play(audioPlayer.audioFragments.FLAP);

        this.velocity.y -= settings.birdFlapVelocity;
    },

    _swim() {
        audioPlayer.play(audioPlayer.audioFragments.SWIM);

        this.velocity.y += settings.birdFlapVelocity;
    }
};

module.exports = bird;
