Paloquiz.states.PublishScore = function(game) {
    this.score = 0;
}

Paloquiz.states.PublishScore.prototype = {

    init: function() {},

    create: function() {
        getJSON('/status', function(gameStatus) {
            if (gameStatus['status'] !== 'finish') {
                this.status.start('Router');
                return;
            }
            this.score = gameStatus['score'];
            if (fbIsLoggedIn()) {
                if (fbCanPublish()) {
                    fbGetUserScore(function(currentScore) {
                        if (this.score > currentScore) {
                            fbPublishScore(this.score,
                                function() {
                                    this.status.start('Finish');
                                },
                                function() {
                                    this.createUI();
                                },
                                this);
                        }
                    }, this);
                } else {
                    this.createUI();
                }
            } else {
                this.createUI();
            }
        }, this);
    },

    shutdown: function() {},

    createUI: function() {
        // Message
        var message = '¿Quieres que tus puntuaciones se guarden en Facebook?';
        var messageTextSize = Math.round(this.world.height * .05);
        var messageBox = {
            x: this.world.width * .1,
            y: this.world.height * .15,
            width: this.world.width * .8,
            height: this.world.height * .47
        }
        var labelStyle = this.positionTextStyle = {
            font: 'Pixel Art',
            fontSize: messageTextSize + 'px',
            fill: 'white',
            align: 'center',
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
            wordWrap: true,
            wordWrapWidth: messageBox.width
        };
        var messageText = this.add.text(0, 0, message, labelStyle);
        messageText.setTextBounds(
            messageBox.x, messageBox.y, messageBox.width, messageBox.height);

        // Buttons
        var buttonsY = this.world.height * .6;
        var buttonsWidth = this.world.width * .47;
        var buttonsHeight = this.world.height * .1;

        var yesButton = this.add.button(
            this.world.width * .02, buttonsY, 'genericButton',
            function() {
                var rerequest = fbIsLoggedIn();
                if (fbCanPublish()) {
                    fbGetUserScore(function(currentScore) {
                        if (this.score > currentScore) {
                            fbPublishScore(this.score,
                                function() {
                                    this.status.start('Finish');
                                },
                                function() {
                                    this.status.start('Finish');
                                },
                                this);
                        }
                    }, this);
                } else {
                    fbLogInPublish(function() {
                        fbGetUserScore(function(currentScore) {
                            if (this.score > currentScore) {
                                fbPublishScore(this.score,
                                    function() {
                                        this.status.start('Finish');
                                    },
                                    this);
                            }
                        }, this);
                    }, this);
                }
            }, this, 3, 3, 3);
        yesButton.height = buttonsHeight;
        yesButton.width = buttonsWidth;

        var noButton = this.add.button(
            this.world.width * .51, buttonsY, 'genericButton',
            function() {
                this.state.start('Finish');
            }, this, 2, 2, 2);
        noButton.width = buttonsWidth;
        noButton.height = buttonsHeight;

        // Labels
        var labelTextSize = Math.round(yesButton.height / 3.0);
        var labelStyle = this.positionTextStyle = {
            font: 'Pixel Art',
            fontSize: labelTextSize + 'px',
            fill: 'white',
            align: 'center'
        };
        var yesText = this.add.text(
            yesButton.x + yesButton.width / 2,
            yesButton.y + yesButton.height / 2,
            'Vale', labelStyle);
        yesText.anchor.setTo(.5, .5);
        var noText = this.add.text(
            noButton.x + noButton.width / 2,
            noButton.y + noButton.height / 2,
            'No', labelStyle);
        noText.anchor.setTo(.5, .5);
    }

}