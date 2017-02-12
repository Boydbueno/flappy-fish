let setup = {
    renderer() {
        let renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.backgroundColor = 0x4ec0ca;
        renderer.autoResize = true;

        document.body.appendChild(renderer.view);

        return renderer;
    },

    loadAssets(callback) {
        PIXI.loader.add("assets/assets.json").load(callback);
    }
};

module.exports = setup;
