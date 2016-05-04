Paloquiz.states.Main = function(game) {
    this.optionsPane;
    this.dialogPane;
    this.host;
    this.scoreText;
    this.loadText;
    this.questionText;
    this.timebar;
    this.timebarTween;
    this.barProgress;
    this.optGroup;
    this.optButtons;
    this.optLabels;
};

Paloquiz.states.Main.prototype = {

    TIMEBAR_OK_COLOR: '#0f0',
    TIMEBAR_WARN_COLOR: '#ff0',
    TIMEBAR_CRIT_COLOR: '#f00',
    ANSWER_TEXT_SIZE: '40px',
    ANSWER_OK_COLOR: '#8b0a50',
    ANSWER_FAIL_COLOR: '#ff0000',
    QUESTION_COLOR: '#ffffff',
    QUESTION_TEXT_SIZE: '26px',
    NUM_ANSWERS: 4,

    init: function() {
        this.createLayoutBoxes();
    },

    preload: function() {},

    create: function() {

        this.optionsPane = this.add.image(this.OPTIONS_PANE_BOX.x, this.OPTIONS_PANE_BOX.y, 'optionsPane');
        this.optionsPane.width = this.OPTIONS_PANE_BOX.width;
        this.optionsPane.height = this.OPTIONS_PANE_BOX.height;
        this.optionsPane.anchor.setTo(0, 0);
        this.optionsPane.smoothed = false;

        this.dialogPane = this.add.image(this.DIALOG_PANE_BOX.x, this.DIALOG_PANE_BOX.y, 'dialogPane');
        this.dialogPane.width = this.DIALOG_PANE_BOX.width;
        this.dialogPane.height = this.DIALOG_PANE_BOX.height;
        this.dialogPane.anchor.setTo(0, 0);
        this.dialogPane.smoothed = false;

        //  var bar = this.add.bitmapData(300, 200);
        this.timebar = this.add.bitmapData(this.TIMEBAR_BOX.width, this.TIMEBAR_BOX.height);
        var timebarImage = this.add.image(this.TIMEBAR_BOX.x, this.TIMEBAR_BOX.y, this.timebar);
        timebarImage.width = this.TIMEBAR_BOX.width;
        timebarImage.height = this.TIMEBAR_BOX.height;
        timebarImage.anchor.setTo(0, 0);
        this.timebar.context.fillStyle = this.TIMEBAR_OK_COLOR;
        this.timebar.context.fillRect(0, 0, this.TIMEBAR_BOX.width, this.TIMEBAR_BOX.height);
        this.barProgress = this.TIMEBAR_BOX.width;

        this.host = this.add.image(this.HOST_BOX.x, this.HOST_BOX.y, 'host');
        this.host.width = this.HOST_BOX.width;
        this.host.height = this.HOST_BOX.height;
        this.host.anchor.setTo(0, 0);
        this.host.smoothed = false;


        //  You can listen for each of these events from Phaser.Loader
        this.load.onFileComplete.add(this.fileComplete, this);

        // Score text
        var scoreMargin = .05 * Math.min(this.game.width, this.game.height);
        this.scoreText = this.add.text(this.game.width - scoreMargin, scoreMargin, '0', {
            fill: '#ffffff',
            align: 'center'
        });
        this.scoreText.anchor.setTo(1, 0);

        // Question text
        this.questionText = this.add.text(
            this.DIALOG_PANE_BOX.x + this.DIALOG_PANE_BOX.width / 2,
            this.DIALOG_PANE_BOX.y + this.DIALOG_PANE_BOX.height / 2, 'Question', {
                font: 'Pixel Art',
                fontSize: this.QUESTION_TEXT_SIZE,
                align: 'center',
                fill: this.QUESTION_COLOR
            });
        this.questionText.anchor.setTo(0.5, 0.5);

        this.createOptionButtons();
        this.updateStatus();
    },

    createOptionButtons: function() {
        this.optGroup = this.add.group();
        this.optButtons = new Array();
        this.optLabels = new Array();

        //Label style
        var labelStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'center',
            fill: 'white'
        };


        for (var i = 0; i < 4; i++) {
            var xOffset = 0;
            var yOffset = i * this.ANSWERS_BOX.height / this.NUM_ANSWERS;

            this.optButtons[i] = this.add.button(
                this.OPTION_BOX.x + xOffset, this.OPTION_BOX.y + yOffset,
                'button', this.actionOnClick, this, 2, 1, 0);
            this.optButtons[i].width = this.OPTION_BOX.width;
            this.optButtons[i].height = this.OPTION_BOX.height;
            this.optButtons[i].anchor.setTo(0, 0)

            this.optLabels[i] = this.add.text(
                this.OPTION_BOX.x + this.OPTION_BOX.width / 2 + xOffset,
                this.OPTION_BOX.y + this.OPTION_BOX.height / 2 + yOffset,
                '', labelStyle);
            this.optLabels[i].anchor.setTo(0.5, 0.5)

            this.optButtons[i].answerId = i;

            this.optGroup.add(this.optButtons[i]);
            this.optGroup.add(this.optLabels[i]);
        }
    },

    showAnswerMessage: function(buttonId, correct) {
        if (correct) {
            this.optButtons[buttonId].setFrames(3, 3, 3);
            this.questionText.setText('Correct! :)');
            this.questionText.fontSize = this.ANSWER_TEXT_SIZE;
            this.questionText.fill = this.ANSWER_OK_COLOR;
        } else {
            this.optButtons[buttonId].setFrames(4, 4, 4);
            this.questionText.setText('Wrong! >:(');
            this.questionText.fontSize = this.ANSWER_TEXT_SIZE;
            this.questionText.fill = this.ANSWER_FAIL_COLOR;
        }

        this.enableInput(false);
        this.time.events.add(Phaser.Timer.SECOND * 2, function() {
            this.questionText.fontSize = this.QUESTION_TEXT_SIZE;
            this.questionText.fill = this.QUESTION_COLOR;
            this.enableInput(true);
            this.optButtons[buttonId].setFrames(2, 1, 0);
            this.barProgress = this.optionsPane.width;
            this.updateStatus();
        }, this);
    },

    finishGame: function() {
        this.questionText.setText('Score = ' + this.scoreText.text);
        this.enableInput(false);
    },

    enableInput: function(enable) {
        this.input.enabled = enable;
    },


    actionOnClick: function(button) {
        this.timebarTween.stop();
        getJSON('/answer/' + button.answerId, function(answerResponse) {

            if (answerResponse['correct']) {
                this.showAnswerMessage(button.answerId, true);
            } else {
                this.showAnswerMessage(button.answerId, false);
            }
        }, this);
    },

    loadQuestionImage: function(imageName, callback) {
        this.onQuestionImageLoaded = callback;
        this.load.image('questionImage', 'questions/' + imageName);
        this.load.start();
    },


    //  This callback is sent the following parameters:
    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        //  this.loadText.setText('File Complete: ' + progress + '% - ' + totalLoaded + ' out of ' + totalFiles);
        if (cacheKey == 'questionImage') {
            this.replaceQuestionImage(cacheKey);
            if (this.onQuestionImageLoaded) {
                this.onQuestionImageLoaded();
            }
        }
    },

    replaceQuestionImage: function(cacheKey) {
        this.clearQuestionImage();

        var newImage = this.add.image(
            this.IMAGE_BOX.x + this.IMAGE_BOX.width / 2, this.IMAGE_BOX.y, cacheKey);

        newImage.anchor.setTo(0.5, 0);

        var resScaleW = this.IMAGE_BOX.width / newImage.width;
        var resScaleH = this.IMAGE_BOX.height / newImage.height;
        var resScale = Math.min(resScaleW, resScaleH);
        newImage.width = newImage.width * resScale;
        newImage.height = newImage.height * resScale;

        this.questionImage = newImage;
    },

    clearQuestionImage: function() {
        if (this.questionImage) {
            this.questionImage.destroy();
            this.questionImage = undefined;
        }
    },

    loadQuestion: function(useHeader) {

        this.clearQuestionImage();

        if (useHeader) {
            getJSON('/questionHeader', function(questionHeader) {
                this.questionText.setText(questionHeader['question']);
                this.loadQuestionImage(questionHeader['img'], function() {
                    getJSON('/question', function(question) {
                        this.questionText.setText(question['question']);
                        this.loadAnswers(question['answers']);
                        this.initTimeBar(question['max_time'], question['time']);
                    }, this);
                });
            }, this);
        } else {
            getJSON('/question', function(question) {
                this.questionText.setText(question['question']);
                this.loadAnswers(question['answers']);
                this.loadQuestionImage(question['img']);
                this.initTimeBar(question['max_time'], question['time']);
            }, this);
        }
    },

    loadAnswers: function(answers) {
        for (var i = 0; i < answers.length; i++) {
            this.optLabels[i].setText(answers[i])
        }
    },

    initTimeBar: function(time, maxTime) {
        this.barProgress = time * this.optionsPane.width / maxTime;

        this.timebarTween = this.add.tween(this);
        this.timebarTween.to({
            barProgress: 0
        }, time, null, true, 0, 0);

        this.timebarTween.onUpdateCallback(this.updateTimebar, this);
        this.timebarTween.onComplete.add(function() {
            this.questionText.setText('Time Out! :S');
            this.questionText.fontSize = this.ANSWER_TEXT_SIZE;
            this.questionText.fill = this.ANSWER_FAIL_COLOR;
            this.enableInput(false);
            this.time.events.add(Phaser.Timer.SECOND * 2, function() {
                this.enableInput(true);
                this.barProgress = this.TIMEBAR_BOX.width;
                this.questionText.fontSize = this.QUESTION_TEXT_SIZE;
                this.questionText.fill = this.QUESTION_COLOR;

                // call answer with any id  and call updateStatus
                getJSON('/answer/0', function() {
                    this.updateStatus();
                }, this);
            }, this);
        }, this);
    },

    updateTimebar: function() {
        // ensure you clear the context each time you update it or the bar will draw on top of itself
        this.timebar.context.clearRect(0, 0, this.timebar.width, this.timebar.height);

        // 25%  = warning
        if (this.barProgress < this.timebar.width * 0.25) {
            this.timebar.context.fillStyle = this.TIMEBAR_CRIT_COLOR;
        }
        // 50%  = warning
        else if (this.barProgress < this.timebar.width * 0.5) {
            this.timebar.context.fillStyle = this.TIMEBAR_WARN_COLOR;
        } else {
            this.timebar.context.fillStyle = this.TIMEBAR_OK_COLOR;
        }

        // draw the bar
        this.timebar.context.fillRect(0, 0, this.barProgress, this.timebar.height);

        // important - without this line, the context will never be updated on the GPU when using webGL
        this.timebar.dirty = true;
    },

    updateStatus: function() {
        getJSON('/status', function(gameStatus) {
            this.scoreText.setText(gameStatus['score']);
            if (gameStatus['status'] == 'start') {
                this.state.start('Start');
            } else if (gameStatus['status'] == 'question') {
                this.loadQuestion(true);
            } else if (gameStatus['status'] == 'answer') {
                this.loadQuestion(false);
            } else if (gameStatus['status'] == 'finish') {
                this.finishGame();
            }
        }, this);

    },


    shutdown: function() {
        // Remove handlers
        this.load.onFileComplete.remove(this.fileComplete, this);


        this.enableInput(true);
    },

    // Boxes
    UI_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    IMAGE_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    DIALOG_PANE_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    TIMEBAR_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    OPTIONS_PANE_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    ANSWERS_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    OPTION_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    HOST_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },

    createLayoutBoxes: function() {
        var margin = 0.03 * Math.min(this.game.width, this.game.height);
        this.UI_BOX.x = margin;
        this.UI_BOX.y = margin;
        this.UI_BOX.width = this.game.width - 2 * margin;
        this.UI_BOX.height = this.game.height - 2 * margin;

        this.IMAGE_BOX.x = this.UI_BOX.x;
        this.IMAGE_BOX.y = this.UI_BOX.y;
        this.IMAGE_BOX.width = this.UI_BOX.width;
        this.IMAGE_BOX.height = this.UI_BOX.height * .37;

        this.DIALOG_PANE_BOX.x = this.UI_BOX.x;
        this.DIALOG_PANE_BOX.y = this.UI_BOX.y + this.UI_BOX.height * .38;
        this.DIALOG_PANE_BOX.width = this.UI_BOX.width;
        this.DIALOG_PANE_BOX.height = this.UI_BOX.height * .20;

        this.TIMEBAR_BOX.x = this.UI_BOX.x;
        this.TIMEBAR_BOX.y = this.UI_BOX.y + this.UI_BOX.height * .59;
        this.TIMEBAR_BOX.width = this.UI_BOX.width;
        this.TIMEBAR_BOX.height = this.UI_BOX.height * .02;

        this.OPTIONS_PANE_BOX.x = this.UI_BOX.x;
        this.OPTIONS_PANE_BOX.y = this.UI_BOX.y + this.UI_BOX.height * .62;
        this.OPTIONS_PANE_BOX.width = this.UI_BOX.width;
        this.OPTIONS_PANE_BOX.height = this.UI_BOX.height * .38;

        var optionsSplit = .75;

        var hostMargin = .1 * this.OPTIONS_PANE_BOX.height;
        this.HOST_BOX.x = this.OPTIONS_PANE_BOX.x + this.OPTIONS_PANE_BOX.width * optionsSplit;
        this.HOST_BOX.y = this.OPTIONS_PANE_BOX.y + hostMargin;
        this.HOST_BOX.width = this.OPTIONS_PANE_BOX.width * (1 - optionsSplit) - hostMargin;
        this.HOST_BOX.height = this.OPTIONS_PANE_BOX.height - 2 * hostMargin;

        var answersMargin = .05 * Math.min(this.OPTIONS_PANE_BOX.width, this.OPTIONS_PANE_BOX.height);
        this.ANSWERS_BOX.x = this.OPTIONS_PANE_BOX.x + answersMargin;
        this.ANSWERS_BOX.y = this.OPTIONS_PANE_BOX.y + answersMargin;
        this.ANSWERS_BOX.width = this.OPTIONS_PANE_BOX.width * optionsSplit - 2 * answersMargin;
        this.ANSWERS_BOX.height = this.OPTIONS_PANE_BOX.height - 2 * answersMargin;

        var optionMargin = .02 * Math.min(this.ANSWERS_BOX.width, this.ANSWERS_BOX.height);
        this.OPTION_BOX.x = this.ANSWERS_BOX.x + optionMargin;
        this.OPTION_BOX.y = this.ANSWERS_BOX.y + optionMargin;
        this.OPTION_BOX.width = this.ANSWERS_BOX.width - optionMargin;
        this.OPTION_BOX.height = this.ANSWERS_BOX.height / this.NUM_ANSWERS - 2 * optionMargin;
    }

};