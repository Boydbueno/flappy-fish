const settings = {
    /**
     * The location of the assets json
     */
    assetFile: "assets/assets.json",

    soundsPath: "assets/sounds/",

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
        'BIG_ZERO': 'font_big_0.png',
        'BIG_ONE': 'font_big_1.png',
        'BIG_TWO': 'font_big_2.png',
        'BIG_THREE': 'font_big_3.png',
        'BIG_FOUR': 'font_big_4.png',
        'BIG_FIVE': 'font_big_5.png',
        'BIG_SIX': 'font_big_6.png',
        'BIG_SEVEN': 'font_big_7.png',
        'BIG_EIGHT': 'font_big_8.png',
        'BIG_NINE': 'font_big_9.png',
    }
};

module.exports = settings;
