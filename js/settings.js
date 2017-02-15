const settings = {
    /**
     * The location of the assets json
     */
    assetFile: "assets/assets.json",

    soundsPath: "assets/sounds/",

    /**
     * The area that is available above the water
     */
    playableAreaAboveWater: 260,

    /**
     * The area that is available below the water
     */
    playableAreaBelowWater: 260,

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
        y: 150,
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
    minPipeHeight: 280,

    /**
     * The max height of a pipe (handle with care)
     */
    maxPipeHeight: 390,

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
        'SMALL_9': 'font_small_9.png',
    },

    init() {
        this.gameWidth = window.innerWidth;
    }
};

settings.init();

module.exports = settings;
