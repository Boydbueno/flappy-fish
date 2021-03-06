let settings = require('./settings');
let utils = require('./utils');

let pipeFactory = {
    textureWidth: 0,

    facing: {
        'UP': 1,
        'DOWN': -1
    },

    create(height, facing) {
        this.pipeTexture = utils.getTexture(settings.textures.PIPE);
        this.pipeTopTexture = utils.getTexture(settings.textures.PIPE_UP);
        this.pipeBottomTexture = utils.getTexture(settings.textures.PIPE_DOWN);

        let container = new PIXI.Container();

        let totalPlayHeight = settings.playableAreaAboveWater + settings.playableAreaBelowWater;

        if (facing === this.facing.UP) {
            container.addChild(this._createUpFacingPipe(height));
        } else if (facing === this.facing.DOWN) {
            container.addChild(this._createDownFacingPipe(height));
        }

        // Check if we have space for pipe in opposite direction to complete the gap
        if (height + settings.pipeGapSize < totalPlayHeight) {
            // We can fit another pipe opposite to it
            let oppositePipeHeight = totalPlayHeight - height - settings.pipeGapSize;
            if (facing === this.facing.UP)
                container.addChild(this._createDownFacingPipe(oppositePipeHeight));

            if (facing === this.facing.DOWN)
                container.addChild(this._createUpFacingPipe(oppositePipeHeight));
        }

        let ceilingSpriteHeight = utils.getTexture(settings.textures.CEILING).height;

        // Store the information of the gap position in the container object for easier collision checks
        let top = (facing === this.facing.UP ? totalPlayHeight - height - settings.pipeGapSize : height) + ceilingSpriteHeight;
        let bottom = (facing === this.facing.UP ? totalPlayHeight - height : height + settings.pipeGapSize) + ceilingSpriteHeight;
        container.gap = { top, bottom }

        return container;
    },

    _createUpFacingPipe(height) {
        let container = new PIXI.Container();

        let pipeTop = new PIXI.Sprite(this.pipeTopTexture);
        container.addChild(pipeTop);

        let pipePartHeight = height - this.pipeTopTexture.height;

        let pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
        pipe.y = this.pipeTopTexture.height;
        container.addChild(pipe);

        // Place pipe on the bottom
        container.y = settings.playableAreaAboveWater + settings.playableAreaBelowWater - height + utils.getTexture(settings.textures.CEILING).height;

        return container;
    },

    _createDownFacingPipe(height) {
        let container = new PIXI.Container();

        let pipePartHeight = height - this.pipeBottomTexture.height;

        let pipe = new PIXI.extras.TilingSprite(this.pipeTexture, this.pipeTexture.width, pipePartHeight);
        container.addChild(pipe);

        let pipeBottom = new PIXI.Sprite(this.pipeBottomTexture);
        pipeBottom.y = pipePartHeight;
        container.addChild(pipeBottom);

        // We can place it against the ceiling
        container.y = utils.getTexture(settings.textures.CEILING).height;

        return container;
    }
}

module.exports = pipeFactory;
