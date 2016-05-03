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

    Paloquiz.game.state.add('Preloader', Paloquiz.states.Preloader);
    Paloquiz.game.state.add('Router', Paloquiz.states.Router);
    Paloquiz.game.state.add('Start', Paloquiz.states.Start);
    Paloquiz.game.state.add('Main', Paloquiz.states.Main);
    Paloquiz.game.state.add('Highscores', Paloquiz.states.Highscores);

    Paloquiz.game.state.start('Preloader');
}

// Common game functions

Paloquiz.addBackground = function (state) {
    var background = state.add.image(state.game.world.centerX, state.game.world.centerY, 'background');
    background.anchor.setTo(0.5, 0.5);
    background.width = state.game.width;
    background.height = state.game.height;
    return background;
}
