Paloquiz.states.Finish = function(game) {
    this.score = 0;
    this.hiscoresButton;
    this.hiscoresLabel;
    this.exitButton;
    this.exitLabel;
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
                fbLogIn(function() {
                    this.hiscoresButton.visible = true;
                    this.hiscoresLabel.visible = true;
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
                    this.state.start('Highscores');
                }, this, 2, 1, 0);
        this.hiscoresButton.smoothed = false;
        this.hiscoresButton.width = this.world.width * .6;
        this.hiscoresButton.height = this.hiscoresButton.width * .3;
        this.hiscoresButton.anchor.setTo(.5, 0);
        this.hiscoresButton.visible = false;

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
        this.hiscoresLabel.visible = false;

        this.exitLabel = this.add.text(
            this.world.centerX,
            this.exitButton.y + this.exitButton.height / 2,
            'Salir', labelStyle);
        this.exitLabel.anchor.setTo(.5, .5);
    }
}