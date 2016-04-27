
window.onload = function() {

    var renderer = Phaser.CANVAS;  // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = false;
    var antialias = false;
    var game = new Phaser.Game(480, 640, renderer, '',
                               { preload: preload, create: create },
                               transparent, antialias);
    // Phaser.Canvas.setImageRenderingCrisp(game.canvas);
    // PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    // Phaser.Canvas.setSmoothingEnabled(game.context, false);

    function preload () {
        game.load.baseURL = '/static/assets/';
        game.load.image('background', 'background.png');
        game.load.spritesheet('host', 'palo.png', 30, 85);
        game.load.image('dialogPane', 'dialog_pane.png');
        game.load.image('optionsPane', 'options_pane.png');
    }

    function create () {

        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.scale.setTo(2, 2);

        var optionsPane = game.add.sprite(game.world.centerX, game.world.height - 260, 'optionsPane');
        optionsPane.anchor.setTo(0.5, 0.0);

        var dialogPane = game.add.sprite(game.world.centerX, 220, 'dialogPane');
        dialogPane.anchor.setTo(0.5, 0.0);

        var host = game.add.sprite(0, 0, 'host');
        // host.smoothed = false;  // does this do something?
        host.x = game.world.width - host.width / 2 - 55;
        host.y = game.world.height - 140;
        host.anchor.setTo(0.5, 0.5);
        host.scale.setTo(2, 2);

    }

};
