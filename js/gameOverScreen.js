let settings = require('./settings');
let utils = require('./utils');

let gameOverScreen = {

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
    initialize(callback) {
        this._setRestartCallback(callback);

        this.container = new PIXI.Container();

        this.container.y = this._getContainerYPosition();
        this.container.x = this.gameOverContainerXPosition;

        this.gameOverContainer = new PIXI.Sprite(utils.getTexture(settings.textures.GAME_OVER));

        this._renderScores(0, 0);

        let restartButton = new PIXI.Sprite(utils.getTexture(settings.textures.RESTART));
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
    updateScores(score, bestScore) {
        this._clearScores();
        this._renderScores(score, bestScore);
    },

    /**
     * Hide the game over screen
     */
    hide() {
        this.gameOverContainer.visible = false;
    },

    /**
     * Show the game over screen
     */
    show() {
        this.gameOverContainer.visible = true;
    },

    /**
     * Set the callback for when the _restart button has been pressed
     * @param callback
     * @private
     */
    _setRestartCallback(callback) {
        if (typeof callback !== 'function') throw new Error('Supplied callback is not a function');

        this.onClickRestart = callback;
    },

    /**
     * @param score
     * @param bestScore
     * @private
     */
    _renderScores(score, bestScore) {
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
    _clearScores() {
        this.gameOverContainer.removeChild(this.scoreSprite);
        this.gameOverContainer.removeChild(this.bestScoreSprite);
    },

    /**
     * @returns {number}
     * @private
     */
    _getContainerYPosition() {
        let ceilingHeight = utils.getTexture(settings.textures.CEILING).height;
        let gameOverScreenHeight = utils.getTexture(settings.textures.GAME_OVER).height;
        return (ceilingHeight + settings.playableAreaAboveWater + settings.playableAreaBelowWater) / 2 - gameOverScreenHeight / 2;
    }

};

module.exports = gameOverScreen;
