const settings = {
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
        'pipeDown': 'pipe-down.png',
    }
};

module.exports = settings;
