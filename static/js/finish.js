Paloquiz.states.Finish = function(game) {
    this.score = 0;
    this.hiscoresButton;
    this.hiscoresLabel;
    this.exitButton;
    this.exitLabel;
    this.fbButton;
}

Paloquiz.states.Finish.prototype = {

    create: function() {
        getJSON('/status', function(gameStatus) {
            if (gameStatus['status'] !== 'finish') {
                this.status.start('Router');
                return;
            }
            getJSON('/summary', function(summary) {
                this.score = summary['score'];
                this.answers = summary['answers'];
                this.numQuestions = summary['num_questions'];
                this.createScoreText();
                this.createUI();
                fbInit(function() {
                    this.fbButton.visible = false;
                    fbGetUserScore(function(currentScore) {
                        if (this.score > currentScore) {
                            fbPublishScore(currentScore);
                        }
                    }, this);
                }, this);
            }, this);
        }, this);
    },

    shutdown: function() {},

    createScoreText: function() {;
        var scoreBaseTextSize = Math.round(.06 * this.world.height);
        var scoreTextColor = '#ff4f1a';

        var scoreHeader = this.add.text(
            this.world.centerX,
            this.world.height * .2,
            'Puntuación', {
                font: 'Pixel Art',
                fontSize: scoreBaseTextSize + 'px',
                fill: scoreTextColor,
                align: 'center'
            });
        scoreHeader.anchor.setTo(.5, 0);

        var scoreText = this.add.text(
            this.world.centerX,
            this.world.height * .33,
            this.score, {
                font: 'Pixel Art',
                fontSize: Math.round(scoreBaseTextSize * 2.2) + 'px',
                fill: scoreTextColor,
                align: 'center'
            });
        scoreText.anchor.setTo(.5, 0);
    },

    createUI: function() {
        // Hiscores
        this.hiscoresButton =
            this.add.button(this.world.centerX, this.world.height * .55,
                'finishButton',
                function() {
                    fbLogIn(function() {
                        this.state.start('Highscores');
                    }, this);
                }, this, 2, 1, 0);
        this.hiscoresButton.smoothed = false;
        this.hiscoresButton.width = this.world.width * .6;
        this.hiscoresButton.height = this.hiscoresButton.width * .3;
        this.hiscoresButton.anchor.setTo(.5, 0);

        // Exit
        this.exitButton =
            this.add.button(this.hiscoresButton.x,
                this.hiscoresButton.y + this.hiscoresButton.height * 1.1,
                'finishButton',
                function() {
                    getJSON('/finish', function() {
                        this.state.start('Router');
                    }, this);
                }, this, 2, 1, 0);
        this.exitButton.smoothed = false;
        this.exitButton.width = this.hiscoresButton.width;
        this.exitButton.height = this.hiscoresButton.height;
        this.exitButton.anchor.setTo(.5, 0);

        // Labels
        var labelTextSize = Math.round(this.hiscoresButton.height / 3.0);
        var labelStyle = this.positionTextStyle = {
            font: 'Pixel Art',
            fontSize: labelTextSize + 'px',
            fill: 'white',
            align: 'center'
        };

        this.hiscoresLabel = this.add.text(
            this.world.centerX,
            this.hiscoresButton.y + this.hiscoresButton.height / 2,
            'Clasificación', labelStyle);
        this.hiscoresLabel.anchor.setTo(.5, .5);

        this.exitLabel = this.add.text(
            this.world.centerX,
            this.exitButton.y + this.exitButton.height / 2,
            'Salir', labelStyle);
        this.exitLabel.anchor.setTo(.5, .5);

        this.createFbUI();
    },

    createFbUI: function() {
        var buttonSize = .1 * Math.min(this.world.width, this.world.height);

        this.fbButton = this.add.button(0, 0, 'fbButton', function() {
            fbLogIn(function() {
                getJSON('/status', function(gameStatus) {
                    this.score = gameStatus['score'];
                    fbGetUserScore(function(currentScore) {
                        if (this.score > currentScore) {
                            fbPublishScore(currentScore, function() {
                                    this.fbButton.visible = false;
                                }, this);
                        }
                    }, this);
                }, this);
            }, this);
        }, this, 1, 0, 1);
        this.fbButton.smoothed = false;
        this.fbButton.height = buttonSize;
        this.fbButton.width = buttonSize;
        this.fbButton.anchor.setTo(0, 0);
        this.fbButton.x = this.fbButton.width * .2;
        this.fbButton.y = this.fbButton.height * .2;
        this.fbButton.visible = true;
    }
}