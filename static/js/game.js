Paloquiz = {};
Paloquiz.states = {};
Paloquiz.orientated = false;
Paloquiz.orientationBlock;
Paloquiz.booted = false;

Paloquiz.MAX_WIDTH_RATIO = 11.0 / 16.0;
Paloquiz.MAX_HEIGHT_RATIO = 16.0 / 9.0;

var CONTAINER_ID = 'gameContainer';

window.onload = function() {

    // Check Facebook status
    fbInit();

    // Element with orientation image
    Paloquiz.orientationBlock = document.getElementById('orientation');

    // // Get game dimensions
    // var gameSize = Paloquiz.getGameScale();

    var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = true;
    var antialias = true;

    // Paloquiz.game = new Phaser.Game(gameSize.width, gameSize.height,
    //     renderer, CONTAINER_ID, {}, transparent, antialias);
    var width = 640;
    var height = 960;
    Paloquiz.game = new Phaser.Game(width, height,
        renderer, CONTAINER_ID, {}, transparent, antialias);

    // Does this do something?
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    if (Paloquiz.game.renderType == Phaser.CANVAS) {
        Phaser.Canvas.setImageRenderingCrisp(game.canvas);
        Phaser.Canvas.setSmoothingEnabled(game.context, false);
    }

    Paloquiz.game.state.add('Boot', Paloquiz.states.Boot);
    Paloquiz.game.state.add('Preloader', Paloquiz.states.Preloader);
    Paloquiz.game.state.add('Router', Paloquiz.states.Router);
    Paloquiz.game.state.add('Start', Paloquiz.states.Start);
    Paloquiz.game.state.add('Main', Paloquiz.states.Main);
    Paloquiz.game.state.add('Highscores', Paloquiz.states.Highscores);
    Paloquiz.game.state.add('Finish', Paloquiz.states.Finish);

    Paloquiz.game.state.start('Boot');
}

// Common game functions

Paloquiz.init = function() {
    Paloquiz.setupLoader();

    // Avoid multiple pointer input
    Paloquiz.game.input.maxPointers = 1;

    // Do not pause when focus is lost
    Paloquiz.game.stage.disableVisibilityChange = true;

    Paloquiz.setupScale();

    Paloquiz.game.state.onStateChange.add(Paloquiz.stateChanged);
}

Paloquiz.setupLoader = function() {
    // Base URL for the loader
    Paloquiz.game.load.baseURL = '/static/';
    // Enable cross-origin image loading
    Paloquiz.game.load.crossOrigin = 'anonymous';
}

Paloquiz.setupScale = function() {
    Paloquiz.orientated = true;

    var game = Paloquiz.game;

    // Stretch
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

    // Center
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    // Check device
    if (game.device.desktop) {
        // On desktop
    } else {
        // On mobile
        // Force portrait
        game.scale.forceOrientation(false, true);
        // Game orientation callbacks
        game.scale.enterIncorrectOrientation.add(function() {
            Paloquiz.orientated = false;
            if (Paloquiz.orientationBlock) {
                Paloquiz.orientationBlock.style.display = 'block';
            }
        }, this);
        game.scale.leaveIncorrectOrientation.add(function() {
            Paloquiz.orientated = true;
            if (Paloquiz.orientationBlock) {
                Paloquiz.orientationBlock.style.display = 'none';
            }
        }, this);
    }

    // Game resizing callback
    game.scale.setResizeCallback(Paloquiz.resize, this);
}

Paloquiz.resize = function () {
    var gameScale = Paloquiz.getGameScale();
    Paloquiz.game.scale.setUserScale(gameScale.x, gameScale.y);
}

Paloquiz.getGameScale = function() {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if ((width / height) > Paloquiz.MAX_WIDTH_RATIO) {
        width = Math.round(height * Paloquiz.MAX_WIDTH_RATIO);
    } else if ((height / width) > Paloquiz.MAX_HEIGHT_RATIO) {
        height = Math.round(width * Paloquiz.MAX_HEIGHT_RATIO);
    }
    return {
        x: width / Paloquiz.game.width,
        y: height / Paloquiz.game.height
    };
}

Paloquiz.stateChanged = function() {
    // Overchecking doesn't hurt
    fbInit();

    Paloquiz.resize();
    Paloquiz.setupBackground();
}

Paloquiz.setupBackground = function() {
    if (!Paloquiz.game.cache.checkImageKey('background')) {
        return;
    }
    if (!Paloquiz.background) {
        Paloquiz.background = new Phaser.Image(Paloquiz.game, 0, 0, 'background');
        Paloquiz.background.anchor.setTo(0, 0);
        Paloquiz.game.stage.addChildAt(Paloquiz.background, 0);
    }
    Paloquiz.background.smoothed = false;
    Paloquiz.background.width = Paloquiz.game.width;
    Paloquiz.background.height = Paloquiz.game.height;
}