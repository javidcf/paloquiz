Paloquiz.states.Start = function (game) {
    this.startButton;
};

Paloquiz.states.Start.prototype = {

    START_BUTTON: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        label: ""
    },

    init: function() {
        // Compute box sizes
        this.START_BUTTON.x = this.game.world.centerX;
        this.START_BUTTON.y = this.game.world.centerY;
        this.START_BUTTON.width = 200;
        this.START_BUTTON.height = 80;
        this.START_BUTTON.label = "Jugar";
    },

    preload: function () {
        this.load.baseURL = '/static/';
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('startButton', 'assets/button_sprite_sheet.png', 189, 66);
    },

    create: function () {

        this.game.stage.background = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'background');
        this.game.stage.background.anchor.setTo(0.5, 0.5);
        this.game.stage.background.width = this.game.width
        this.game.stage.background.height = this.game.height

        this.startButton = this.add.button(this.START_BUTTON.x, this.START_BUTTON.y, 'startButton', function() {
            getJSON('/start', function() {
                this.state.start('Main');
            }, this);
        }, this, 0, 1, 2);

        this.startButton.height = this.START_BUTTON.height;
        this.startButton.width = this.START_BUTTON.width;
        this.startButton.anchor.setTo(0.5, 0.5)

        var startButtonLabel = this.add.text(this.START_BUTTON.x, this.START_BUTTON.y, this.START_BUTTON.label, {
            font: 'Pixel Art',
            fontSize: '20px',
            align: 'center',
            fill: 'white'
         });

        startButtonLabel.anchor.setTo(0.5, 0.5);

    }

}