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
    },

    create: function () {

        var background = this.add.image(this.game.world.centerX, this.game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.width = this.game.width;
        background.height = this.game.height;

        this.startButton = this.add.button(this.START_BUTTON.x, this.START_BUTTON.y, 'startButton', function() {
            getJSON('/start', function() {
                this.state.start('Main');
            }, this);
        }, this, 1, 0, 2);

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