Paloquiz.states.Finish = function(game) {
    this.score = 0;
    this.starts;
    this.answers;
    this.numQuestions;
    this.hiscoresButton;
    this.hiscoresLabel;
    this.exitButton;
    this.exitLabel;
    this.fbButton;
}

Paloquiz.states.Finish.prototype = {

    STARS_NUMBER: 5,
    STAR_SIZE: 0,

    init: function() {
        this.STAR_SIZE = 0.1 * Math.min(this.world.width, this.world.height);
    },

    create: function() {
        getJSON('/status', function(gameStatus) {
            if (gameStatus['status'] !== 'finish') {
                this.state.start('Router');
                return;
            }
            getJSON('/summary', function(summary) {
                this.score = summary['score'];
                this.answers = summary['answers'];
                this.numQuestions = summary['num_questions'];
                this.createScoreText();
                this.createUI();
                this.createStars();
            }, this);
        }, this);
    },

    shutdown: function() {},

    createStars: function() {
        this.stars = new Array();
        var startY = this.world.centerY 
        var firstStartX = this.world.centerX - (this.STAR_SIZE * this.STARS_NUMBER/2)

        var hitRate = 0;
        var hits = 0;

        this.answers.forEach(function(hit){
           if (hit){
                hits = hits + 1;
           }
        });

        hitRate = hits / this.numQuestions;
        var starsAchieved = Math.round(this.STARS_NUMBER * hitRate);

        for (var i = 0; i < this.STARS_NUMBER; i++) {
            if (i+1 <= starsAchieved){
                this.stars[i] = this.add.image(0, 0, 'star', 1)
            }else{
                this.stars[i] = this.add.image(0, 0, 'star', 0)
            }

            this.stars[i].height = this.STAR_SIZE;
            this.stars[i].width = this.STAR_SIZE;
            this.stars[i].anchor.setTo(0, 0);
            this.stars[i].x = firstStartX + this.STAR_SIZE * i ;
            this.stars[i].y = startY;
        }
    },


    createScoreText: function() {;
        var scoreBaseTextSize = Math.round(.06 * this.world.height);
        var scoreTextColor = '#ff4f1a';

        var scoreHeader = this.add.text(
            this.world.centerX,
            this.world.height * 0.15,
            'Puntuación', {
                font: 'Pixel Art',
                fontSize: scoreBaseTextSize + 'px',
                fill: scoreTextColor,
                align: 'center'
            });
        scoreHeader.anchor.setTo(0.5, 0);

        var scoreText = this.add.text(
            this.world.centerX,
            this.world.height * 0.28,
            this.score, {
                font: 'Pixel Art',
                fontSize: Math.round(scoreBaseTextSize * 2.2) + 'px',
                fill: scoreTextColor,
                align: 'center'
            });
        scoreText.anchor.setTo(0.5, 0);
    },

    createUI: function() {
        // Hiscores
        this.hiscoresButton =
            this.add.button(this.world.centerX, this.world.height * 0.60,
                'genericButton',
                 function() {
                    fbLogIn(function() {
                        this.state.start('Highscores');
                    }, this);
                }, this, 1, 0, 1);
        this.hiscoresButton.width = this.world.width * .6;
        this.hiscoresButton.height = this.hiscoresButton.width * 0.3;
        this.hiscoresButton.anchor.setTo(.5, 0);

        // Exit
        this.exitButton =
            this.add.button(this.hiscoresButton.x,
                this.hiscoresButton.y + this.hiscoresButton.height * 1.1,
                'genericButton',
                function() {
                    getJSON('/finish', function() {
                        this.state.start('Router');
                    }, this);
                }, this, 1, 0, 1);
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
            'Reiniciar', labelStyle);
        this.exitLabel.anchor.setTo(.5, .5);

        this.createFbUI();

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
            this.state.start('PublishScore');
        }, this, 1, 0, 1);
        this.fbButton.height = buttonSize;
        this.fbButton.width = buttonSize;
        this.fbButton.anchor.setTo(1, 0);
        this.fbButton.x = this.world.width - this.fbButton.width * .2;
        this.fbButton.y = this.fbButton.height * .2;
        this.fbButton.visible = !fbCanPublish();
    }
}