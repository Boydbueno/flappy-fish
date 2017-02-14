let settings = require('./settings');

let utils = {

    scoreSize: {
        'SMALL': 0,
        'BIG': 1
    },

    /**
     * Get a texture from the pixi loader by name
     * @param name texture name, with extension
     * @returns {*|PIXI.Texture|FrameObject}
     */
    getTexture(name) {
        return PIXI.loader.resources[settings.assetFile].textures[name]
    },

    /**
     * Generate score sprites based on passed score
     * @param score
     * @param size
     * @returns {Container|*}
     */
    scoreToSprites(score, size) {
        let stringScore = score.toString();

        let texturePrefix = size === this.scoreSize.BIG ? 'BIG_' : 'SMALL_';
        let letterSpacing = size === this.scoreSize.BIG ? 25 : 10;

        let digitsContainer = new PIXI.Container();

        for (let i = 0, len = stringScore.length; i < len; i++) {
            let digit = new PIXI.Sprite(this.getTexture(settings.textures[texturePrefix + stringScore.charAt(i)]));
            digit.x = i * letterSpacing;
            digitsContainer.addChild(digit)
        }

        return digitsContainer;
    }
};

module.exports = utils;
