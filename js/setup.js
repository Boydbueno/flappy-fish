let settings = require('./settings');

let setup = {
    /**
     * Set up the renderer
     * @returns {PIXI.WebGLRenderer|PIXI.CanvasRenderer}
     */
    renderer() {
        let renderer = PIXI.autoDetectRenderer(settings.gameWidth, this.playableAreaAboveWater + this.playableAreaBelowWater);
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.backgroundColor = 0x4ec0ca;
        renderer.autoResize = true;

        document.body.appendChild(renderer.view);

        return renderer;
    },

    /**
     * Load the assets
     * @param callback action to perform after assets have been loaded
     */
    loadAssets(callback) {
        if (typeof callback !== 'function') throw new Error('Callback must be a function');

        PIXI.loader.add(settings.assetFile).load(callback);
    }
};

module.exports = setup;
