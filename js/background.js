let settings = require('./settings.js');
let utils = require('./utils.js');

var background = {
    /**
     * The container that will contain all background tiles lined up
     */
    container: undefined,

    /**
     * The width of one background tile, is needed in some calculations/checks
     */
    skyTileWidth: 0,

    initialize() {
        this.container = new PIXI.Container();
        let skyTileTexture = utils.getTexture(settings.textures.background)
        this.skyTileWidth = skyTileTexture.width;

        this.container.y = settings.playableAreaAboveWater - skyTileTexture.height + utils.getTexture(settings.textures.ceiling).height;

        utils.fillContainerWithWindowWidthTiles(this.container, skyTileTexture);

        return this;
    },

    loop() {
        this.container.x += -settings.backgroundSpeed;

        // By moving the whole background back at the right moment we don't have to worry about tracking individual tiles
        if (this.container.x <= -this.skyTileWidth) {
            this.container.x = 0;
        }
    },

    /**
     * Get the element that needs to be rendered
     * @returns {Container}
     */
    getElement() {
        return this.container;
    }
};

module.exports = background;
