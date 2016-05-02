Paloquiz = {};
Paloquiz.states = {};

var CONTAINER_ID = 'gameContainer';

window.onload = function () {
    var container = document.getElementById(CONTAINER_ID);

    // Check Facebook status
    fbInit();

    var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = false;
    var antialias = true;

    Paloquiz.game = new Phaser.Game(container.clientWidth, container.clientHeight,
        renderer, CONTAINER_ID, {}, transparent, antialias);

    // Does this do something?
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    if (Paloquiz.game.renderType == Phaser.CANVAS) {
        Phaser.Canvas.setImageRenderingCrisp(game.canvas);
        Phaser.Canvas.setSmoothingEnabled(game.context, false);
    }

    Paloquiz.game.state.add('Start', Paloquiz.states.Start);
    Paloquiz.game.state.add('Main', Paloquiz.states.Main);
    Paloquiz.game.state.add('Highscores', Paloquiz.states.Highscores);

    getJSON('/status', function(gameStatus) {
        if (gameStatus['status'] == 'start') {
            Paloquiz.game.state.start('Start');
        }else{
            Paloquiz.game.state.start('Main');
        }
    }, this);
    
}
