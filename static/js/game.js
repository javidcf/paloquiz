Paloquiz = {};
Paloquiz.states = {};

var CONTAINER_ID = 'gameContainer';

window.onload = function () {
    var container = document.getElementById(CONTAINER_ID);

    var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = false;
    var antialias = true;

    function init() {
            fbInit();

            // Does this do something?
            PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
            if (game.renderType == Phaser.CANVAS) {
                Phaser.Canvas.setImageRenderingCrisp(game.canvas);
                Phaser.Canvas.setSmoothingEnabled(game.context, false);
            }
    }

    Paloquiz.game = new Phaser.Game(container.clientWidth, container.clientHeight,
        renderer, CONTAINER_ID, {
            init: init
        },
        transparent, antialias);


    Paloquiz.game.state.add('Main', Paloquiz.states.Main);
    Paloquiz.game.state.add('Highscores', Paloquiz.states.Highscores);
    Paloquiz.game.state.start('Main');
}
