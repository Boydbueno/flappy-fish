let settings = require('./settings.js');
let utils = require('./utils.js');

var background = {
    /**
     * The container that will contain all background tiles lined up
     */
    backgroundSprite: undefined,

    /**
     * Initialize the background
     * @returns {PIXI.Sprite}
     */
    initialize() {
        let skyTileTexture = utils.getTexture(settings.textures.background);
        this.backgroundSprite = new PIXI.extras.TilingSprite(skyTileTexture, settings.gameWidth, skyTileTexture.height);
        this.backgroundSprite.y = this._getBackgroundSpriteYPosition(skyTileTexture.height);

        return this.backgroundSprite;
    },

    /**
     * Update loop of the background
     */
    loop() {
        this.backgroundSprite.tilePosition.x += -settings.backgroundSpeed;
    },

    /**
     * Get the y position for the background sprite
     * @returns {Number}
     * @private
     */
    _getBackgroundSpriteYPosition(height) {
        return settings.playableAreaAboveWater - height + utils.getTexture(settings.textures.ceiling).height;
    }
};

module.exports = background;
