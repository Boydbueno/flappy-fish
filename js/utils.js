let settings = require('./settings');

let utils = {

    /**
     * Get a texture from the pixi loader by name
     * @param name texture name, with extension
     * @returns {*|PIXI.Texture|FrameObject}
     */
    getTexture(name) {
        return PIXI.loader.resources[settings.assetFile].textures[name]
    },

    /**
     * Fill a given pixi container and fill it with vertically aligned tiles fitting whole window width
     * @param container
     * @param texture
     */
    fillContainerWithWindowWidthTiles(container, texture) {
        let requiredTiles = this._getRequiredWidthTiles(texture.width);

        for (let i = 0; i < requiredTiles; i++) {
            let tile = new PIXI.Sprite(texture);
            tile.x = tile.width * i;
            container.addChild(tile);
        }
    },

    _getRequiredWidthTiles(tileWidth) {
        return Math.ceil(window.innerWidth / tileWidth) + 1;
    }

};

module.exports = utils;
