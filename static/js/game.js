Paloquiz = {};
Paloquiz.states = {};
Paloquiz.orientated = false;
Paloquiz.orientationBlock;
Paloquiz.booted = false;

Paloquiz.MAX_WIDTH_RATIO = 11.0 / 16.0;
Paloquiz.MAX_HEIGHT_RATIO = 16.0 / 9.0;

var GAME_CONTAINER_ID = 'game-container';
var ORIENTATION_BLOCK_ID = 'orientation';
var FB_BUTTONS_ID = 'fb-buttons';

window.onload = function() {

    // Game container
    Paloquiz.gameContainer = document.getElementById(GAME_CONTAINER_ID);

    // Element with orientation image
    Paloquiz.orientationBlock = document.getElementById(ORIENTATION_BLOCK_ID);

    // Facebook buttons
    Paloquiz.fbButtons = document.getElementById(FB_BUTTONS_ID);

    // Make sure web fonts are loaded before starting
    WebFont.load({
        custom: {
            families: ['Pixel Art']
        },
        active: function() {
            var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
            var transparent = true;
            var antialias = true;

            var width = 640;
            var height = 960;
            Paloquiz.game = new Phaser.Game(width, height,
                renderer, GAME_CONTAINER_ID, {}, transparent, antialias);

            Paloquiz.game.state.add('Boot', Paloquiz.states.Boot);
            Paloquiz.game.state.add('Preloader', Paloquiz.states.Preloader);
            Paloquiz.game.state.add('Router', Paloquiz.states.Router);
            Paloquiz.game.state.add('Start', Paloquiz.states.Start);
            Paloquiz.game.state.add('Main', Paloquiz.states.Main);
            Paloquiz.game.state.add('Highscores', Paloquiz.states.Highscores);
            Paloquiz.game.state.add('PublishScore', Paloquiz.states.PublishScore);
            Paloquiz.game.state.add('Finish', Paloquiz.states.Finish);
            Paloquiz.game.state.add('Credits', Paloquiz.states.Credits);

            Paloquiz.game.state.start('Boot');
        }
    });
}

// Common game functions

Paloquiz.init = function() {
    // Check Facebook status
    fbInit();

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
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.USER_SCALE;

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

Paloquiz.setupFullscreen = function() {
    console.log(Paloquiz.game.device);
    if (!Paloquiz.game.device.desktop && !Paloquiz.game.scale.isFullScreen) {
        Paloquiz.game.scale.startFullScreen(true);
    }
}

Paloquiz.resize = function() {
    var gameScale = Paloquiz.getGameScale();
    Paloquiz.game.scale.setUserScale(gameScale.x, gameScale.y);
    Paloquiz.positionFbButtons();
}

Paloquiz.getGameScale = function() {
    var width = Math.max(document.documentElement.clientWidth, 0);
    var height = Math.max(document.documentElement.clientHeight, 0);
    // Apparently not necessary
    // if (Paloquiz.game.scale.isFullScreen) {
    //     width = Math.max(window.screen.availWidth, 0);
    //     height = Math.max(window.screen.availHeight, 0);
    // }
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
    Paloquiz.resize();
    Paloquiz.setupBackground();
    Paloquiz.enableFbButtons(true);
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

Paloquiz.positionFbButtons = function() {
    var top = Paloquiz.game.scale.bounds.y;
    var left = Paloquiz.game.scale.bounds.x;
    var height = Paloquiz.game.scale.bounds.height;
    var width = Paloquiz.game.scale.bounds.width;
    var margin = height * .02;
    Paloquiz.fbButtons.style.top = Math.round(top + margin) + 'px';
    Paloquiz.fbButtons.style.left = Math.round(left + margin) + 'px';
}

Paloquiz.enableFbButtons = function(show) {
    if (show) {
        Paloquiz.fbButtons.style.display = 'block';
    } else {
        Paloquiz.fbButtons.style.display = 'none';
    }
}
