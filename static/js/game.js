Paloquiz = {};
Paloquiz.states = {};

var CONTAINER_ID = 'gameContainer';

window.onload = function () {
    var container = document.getElementById(CONTAINER_ID);

    // Check Facebook status
    fbInit();

    var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = true;
    var antialias = true;

    Paloquiz.game = new Phaser.Game(container.clientWidth, container.clientHeight,
        renderer, CONTAINER_ID, {}, transparent, antialias);

    // Does this do something?
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    if (Paloquiz.game.renderType == Phaser.CANVAS) {
        Phaser.Canvas.setImageRenderingCrisp(game.canvas);
        Phaser.Canvas.setSmoothingEnabled(game.context, false);
    }

    Paloquiz.game.state.onStateChange.add(Paloquiz.setupBackground);

    Paloquiz.game.state.add('Preloader', Paloquiz.states.Preloader);
    Paloquiz.game.state.add('Router', Paloquiz.states.Router);
    Paloquiz.game.state.add('Start', Paloquiz.states.Start);
    Paloquiz.game.state.add('Main', Paloquiz.states.Main);
    Paloquiz.game.state.add('Highscores', Paloquiz.states.Highscores);

    Paloquiz.game.state.start('Preloader');
}

// Common game functions

Paloquiz.setupBackground = function () {
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

Paloquiz.goFullscreen = function () {
    Paloquiz.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    if (!Paloquiz.game.scale.isFullScreen)
    {
        Paloquiz.game.scale.startFullscreen(false);
    }
}
