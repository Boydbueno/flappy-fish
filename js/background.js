let settings = require('./settings.js');
let utils = require('./utils.js');

var background = {
    /**
     * The container that will contain all background tiles lined up
     */
    backgroundSprite: undefined,

    /**
     * The width of one background tile, is needed in some calculations/checks
     */
    skyTileWidth: 0,

    initialize() {
        let skyTileTexture = utils.getTexture(settings.textures.background)
        this.backgroundSprite = new PIXI.extras.TilingSprite(skyTileTexture, window.innerWidth, skyTileTexture.height);
        this.backgroundSprite.y = settings.playableAreaAboveWater - skyTileTexture.height + utils.getTexture(settings.textures.ceiling).height;

        return this;
    },

    loop() {
        this.backgroundSprite.tilePosition.x += -settings.backgroundSpeed;
    },

    /**
     * Get the element that needs to be rendered
     * @returns {Container}
     */
    getElement() {
        return this.backgroundSprite;
    }
};

module.exports = background;
