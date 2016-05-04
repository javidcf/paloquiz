Paloquiz.states.Finish = function(game) {
    this.score = 0;
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
    },

    createUI: function() {
        this.hiscoresButton =
            this.add.button(this.world.centerX, this.world.height * .6,
                'finishButton',
                function() {
                    this.state.start('Highscores');
                }, this, 2, 1, 0);
        this.hiscoresButton.smoothed = false;
        this.hiscoresButton.width = this.world.width * .6;
        this.hiscoresButton.height = this.hiscoresButton.width * .3;
        this.hiscoresButton.anchor.setTo(.5, 0);
        this.hiscoresButton.visible = false;

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
    },

    finishGame: function() {;
    },

    submitScore: function() {;
    }
}