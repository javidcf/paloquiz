Paloquiz.states.Start = function(game) {
    this.startButton;
    this.fbButton;
    this.hiscoresButton;
};

Paloquiz.states.Start.prototype = {

    LOGO_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        label: ""
    },

    START_BUTTON_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        label: ""
    },

    init: function() {
        // Compute box sizes
        this.LOGO_BOX.x = this.world.width * .15;
        this.LOGO_BOX.y = this.world.height * .15;
        this.LOGO_BOX.width = this.world.width * .7;
        this.LOGO_BOX.height = this.LOGO_BOX.width;

        this.START_BUTTON_BOX.x = this.world.width * .25;
        this.START_BUTTON_BOX.y = this.world.height * .68;
        this.START_BUTTON_BOX.width = this.world.width * .5;
        this.START_BUTTON_BOX.height = this.START_BUTTON_BOX.width * .3;
        this.START_BUTTON_BOX.label = "Jugar";
    },

    create: function() {

        var logo = this.add.image(this.LOGO_BOX.x, this.LOGO_BOX.y, 'logo');
        logo.width = this.LOGO_BOX.width;
        logo.height = this.LOGO_BOX.height;
        logo.anchor.setTo(0, 0);

        this.startButton = this.add.button(
            this.START_BUTTON_BOX.x, this.START_BUTTON_BOX.y, 'genericButton',
            function() {
                Paloquiz.setupFullscreen();
                this.state.start('Main');
            }, this, 1, 0, 1);
        this.startButton.height = this.START_BUTTON_BOX.height;
        this.startButton.width = this.START_BUTTON_BOX.width;
        this.startButton.anchor.setTo(0, 0);

        var startFontSize = Math.round(this.START_BUTTON_BOX.height / 2.5);
        var startButtonLabel = this.add.text(
            this.startButton.x + this.startButton.width / 2,
            this.startButton.y + this.startButton.height / 2,
            this.START_BUTTON_BOX.label, {
                font: 'Pixel Art',
                fontSize: startFontSize + 'px',
                align: 'center',
                fill: 'white'
            });
        startButtonLabel.anchor.setTo(0.5, 0.5);

        // Facebook stuff
        this.createFbUI();
        if (fbIsLoggedIn()) {
            this.fbButton.visible = false;
            this.hiscoresButton.visible = true;
        } else {
            this.fbButton.visible = true;
            this.hiscoresButton.visible = false;
        }

        // Credits button
        var creditsSize = Math.round(this.world.height / 40);
        var credits = this.add.text(
            this.world.centerX,
            this.world.height * .97,
            'Créditos', {
                font: 'Pixel Art',
                fontSize: creditsSize + 'px',
                align: 'center',
                // fontWeight: 'bold',
                fill: 'white'
            });
        credits.anchor.setTo(.5, 1);
        credits.inputEnabled = true;
        credits.input.useHandCursor = true;
        credits.events.onInputDown.add(function() {
            this.state.start('Credits');
        }, this);

    },

    createFbUI: function() {
        var buttonSize = .1 * Math.min(this.world.width, this.world.height);

        this.fbButton = this.add.button(0, 0, 'fbButton', function() {
            fbLogIn(function() {
                this.state.start('Highscores');
            }, this);
        }, this, 1, 0, 1);
        this.fbButton.height = buttonSize;
        this.fbButton.width = buttonSize;
        this.fbButton.anchor.setTo(1, 0);
        this.fbButton.x = this.world.width - this.fbButton.width * .2;
        this.fbButton.y = this.fbButton.height * .2;
        this.fbButton.visible = true;

        this.hiscoresButton = this.add.button(0, 0, 'hiscoresButton', function() {
            this.state.start('Highscores');
        }, this, 1, 0, 1);
        this.hiscoresButton.height = buttonSize;
        this.hiscoresButton.width = buttonSize;
        this.hiscoresButton.anchor.setTo(1, 0);
        this.hiscoresButton.x = this.world.width - this.hiscoresButton.width * .2;
        this.hiscoresButton.y = this.hiscoresButton.height * .2;
        this.hiscoresButton.visible = false;
    }

}