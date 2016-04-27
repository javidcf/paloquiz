
window.onload = function() {

    // TODO make this local later
    game = new Phaser.Game(480, 640, Phaser.AUTO, '', { preload: preload, create: create });

    function preload () {
        game.load.baseURL = '/static/assets/';
        game.load.image('background', 'background.png');
        game.load.spritesheet('host', 'palo.png', 111, 114);
    }

    function create () {

        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.scale.setTo(2, 2);

        host = game.add.sprite(0, 0, 'host');
        host.x = game.world.width - host.width / 2 - 40;
        host.y = game.world.centerY + game.world.height / 4;
        host.anchor.setTo(0.5, 0.5);

    }

};
