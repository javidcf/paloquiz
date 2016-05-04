Paloquiz.states.Start = function (game) {
    this.startButton;
    this.fbButton;
    this.hiscoresButton;
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

    create: function () {

        this.startButton = this.add.button(this.START_BUTTON.x, this.START_BUTTON.y, 'startButton', function() {
            getJSON('/start', function() {
                this.state.start('Main');
            }, this);
        }, this, 1, 0, 2);

        this.startButton.height = this.START_BUTTON.height;
        this.startButton.width = this.START_BUTTON.width;
        this.startButton.anchor.setTo(0.5, 0.5);

        var startButtonLabel = this.add.text(this.START_BUTTON.x, this.START_BUTTON.y, this.START_BUTTON.label, {
            font: 'Pixel Art',
            fontSize: '20px',
            align: 'center',
            fill: 'white'
         });

        startButtonLabel.anchor.setTo(0.5, 0.5);

        // Facebook stuff
        this.createFbUI();
        fbInit(function() {
            // Is logged in
            this.fbButton.visible = false;
            this.hiscoresButton.visible = true;
        },
        function() {
            // Is not logged in
            this.fbButton.visible = true;
            this.hiscoresButton.visible = false;
        },
        this);

    },

    createFbUI: function () {
        var buttonSize = .1 * Math.min(this.game.width, this.game.height);

        this.fbButton = this.add.button(0, 0, 'fbButton', function() {
            fbLogIn(function() {
                this.fbButton.visible = false;
                this.hiscoresButton.visible = true;
            }, this);
        }, this, 1, 0, 1);
        this.fbButton.smoothed = false;
        this.fbButton.height = buttonSize;
        this.fbButton.width = buttonSize;
        this.fbButton.anchor.setTo(0, 0);
        this.fbButton.x = this.fbButton.width * .2;
        this.fbButton.y = this.fbButton.height * .2;
        this.fbButton.visible = true;

        this.hiscoresButton = this.add.button(0, 0, 'hiscoresButton', function() {
            this.state.start('Highscores');
        }, this, 1, 0, 1);
        this.hiscoresButton.smoothed = false;
        this.hiscoresButton.height = buttonSize;
        this.hiscoresButton.width = buttonSize;
        this.hiscoresButton.anchor.setTo(0, 0);
        this.hiscoresButton.x = this.hiscoresButton.width * .2;
        this.hiscoresButton.y = this.hiscoresButton.height * .2;
        this.hiscoresButton.visible = false;
    }

}