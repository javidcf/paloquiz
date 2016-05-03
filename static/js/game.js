Paloquiz = {};
Paloquiz.states = {};
Paloquiz.orientated = false;
Paloquiz.orientationBlock;

var CONTAINER_ID = 'gameContainer';

window.onload = function() {

    // Check Facebook status
    fbInit();

    // Element with orientation image
    Paloquiz.orientationBlock = document.getElementById('orientation');

    var width = 640;
    var height = 960;
    var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = true;
    var antialias = true;

    Paloquiz.game = new Phaser.Game(width, height, renderer, CONTAINER_ID, {}, transparent, antialias);

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

    Paloquiz.game.state.start('Boot');
}

// Common game functions

Paloquiz.init = function() {
    // Base URL for the loader
    Paloquiz.game.load.baseURL = '/static/';
    // Enable cross-origin image loading
    Paloquiz.game.load.crossOrigin = 'anonymous';

    // Avoid multiple pointer input
    Paloquiz.game.input.maxPointers = 1;

    // Do not pause when focus is lost
    Paloquiz.game.stage.disableVisibilityChange = true;

    Paloquiz.setupScale();

    Paloquiz.game.state.onStateChange.add(Paloquiz.setupBackground);
}

Paloquiz.setupScale = function() {
    Paloquiz.orientated = true;

    var game = Paloquiz.game;
    // Stretch
    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    // Center
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    var minWidth = game.width / 2;
    var minHeight = game.height / 2;
    // Check device
    if (game.device.desktop) {
        // On desktop
        console.log(minWidth, minHeight,
            game.width, game.height);
        game.scale.setMinMax(minWidth, minHeight,
            game.width, game.height);
        game.scale.refresh();
    } else {
        // On mobile
        game.scale.setMinMax(minWidth, minHeight,
            game.width * 2.5, game.height * 2.5);
        // Force portrait
        game.scale.forceOrientation(false, true);
        // Game resizing callback
        // game.scale.hasResized.add(function () {}, this);
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
            game.scale.refresh();
        }, this);
        game.scale.refresh();
    }
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
    Paloquiz.background.width = Paloquiz.game.width;
    Paloquiz.background.height = Paloquiz.game.height;
}