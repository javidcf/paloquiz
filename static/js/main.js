Paloquiz.states.Main = function(game) {
    this.optionsPane;
    this.dialogPane;
    this.imageFrame;
    this.imageMask;
    this.host;
    this.scoreText;
    this.qCountText;
    this.loadText;
    this.questionText;
    this.timebar;
    this.timebarCrop;
    this.timebarTween;
    this.timebarProgress;
    this.optGroup;
    this.optButtons;
    this.optLabels;
};

Paloquiz.states.Main.prototype = {

    TIMEBAR_OK_COLOR: '#0f0',
    TIMEBAR_WARN_COLOR: '#ff0',
    TIMEBAR_CRIT_COLOR: '#f00',
    ANSWER_TEXT_SIZE: '',
    ANSWER_OK_COLOR: '#8b0a50',
    ANSWER_FAIL_COLOR: '#ff0000',
    QUESTION_TEXT_SIZE: '',
    QUESTION_COLOR: '#ffffff',
    OPTION_TEXT_SIZE: '',
    OPTION_COLOR: '#ffffff',
    SCORE_TEXT_SIZE: '',
    SCORE_COLOR: '#ffffff',
    QCOUNT_TEXT_SIZE: '',
    QCOUNT_COLOR: '#ffffff',
    NUM_ANSWERS: 4,
    CORRECT_PHRASES:["¡Toma ya!","¡Efectiviwonder!","Sabía que la sabrías"],
    WRONG_PHRASES: ["¡¿En serio?!","¡Venga ya!","Esta era un básico"],
    TIMEOUT_PHRASES:["Se acabó el tiempo...", "¡Date más prisa!", "Noo... ¡El tiempo!"],

    QUESTION_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },

    init: function() {
        // Font sizes
        var smallerDim = Math.min(this.world.width, this.world.height);
        this.SCORE_TEXT_SIZE = Math.round(.05 * smallerDim) + 'px';
        this.ANSWER_TEXT_SIZE = Math.round(.07 * smallerDim) + 'px';
        this.QUESTION_TEXT_SIZE = Math.round(.045 * smallerDim) + 'px';
        this.OPTION_TEXT_SIZE = Math.round(.04 * smallerDim) + 'px';
        this.QCOUNT_TEXT_SIZE = Math.round(.04 * smallerDim) + 'px';

        this.createLayoutBoxes();
    },

    preload: function() {},

    create: function() {
        Paloquiz.enableFbButtons(false);

        var exitButtonSize = .1 * Math.min(this.world.width, this.world.height);
        var exitButton = this.add.button(
            this.world.width - .2 * exitButtonSize, .2 * exitButtonSize,
            'exitButton', function() {
                getJSON('/finish', function() {
                    this.state.start('Router');
                }, this);
            }, this, 1, 0, 1);
        exitButton.width = exitButtonSize;
        exitButton.height = exitButtonSize;
        exitButton.anchor.setTo(1, 0);

        this.optionsPane = this.add.image(this.OPTIONS_PANE_BOX.x, this.OPTIONS_PANE_BOX.y, 'optionsPane');
        this.optionsPane.width = this.OPTIONS_PANE_BOX.width;
        this.optionsPane.height = this.OPTIONS_PANE_BOX.height;
        this.optionsPane.anchor.setTo(0, 0);

        this.imageFrame = this.add.image(this.IMAGE_BOX.x, this.IMAGE_BOX.y, 'imageFrame');
        this.imageFrame.width = this.IMAGE_BOX.width;
        this.imageFrame.height = this.IMAGE_BOX.height;
        this.imageFrame.anchor.setTo(0, 0);

        this.dialogPane = this.add.image(this.DIALOG_PANE_BOX.x, this.DIALOG_PANE_BOX.y, 'dialogPane');
        this.dialogPane.width = this.DIALOG_PANE_BOX.width;
        this.dialogPane.height = this.DIALOG_PANE_BOX.height;
        this.dialogPane.anchor.setTo(0, 0);

        var timebarBase = this.add.image(this.TIMEBAR_BOX.x, this.TIMEBAR_BOX.y, 'timebar', 0);
        timebarBase.width = this.TIMEBAR_BOX.width;
        timebarBase.height = this.TIMEBAR_BOX.height;
        timebarBase.anchor.setTo(0, 0);
        this.timebar = this.add.image(this.TIMEBAR_BOX.x, this.TIMEBAR_BOX.y, 'timebar', 1);
        this.timebar.width = this.TIMEBAR_BOX.width;
        this.timebar.height = this.TIMEBAR_BOX.height;
        this.timebar.anchor.setTo(0, 0);
        this.timebarCrop = new Phaser.Rectangle(0, 0, this.timebar.width, this.timebar.height);
        this.timebar.crop(this.timebarCrop);

        //  You can listen for each of these events from Phaser.Loader
        this.load.onFileComplete.add(this.fileComplete, this);

        // Score text
        this.scoreText = this.add.text(
            this.world.width * .01, this.world.height * .032, '0', {
                font: 'Pixel Art',
                fontSize: this.SCORE_TEXT_SIZE,
                fill: this.SCORE_COLOR,
                align: 'center'
            });
        this.scoreText.anchor.setTo(0, .5);

        this.qCountText = this.add.text(
            this.world.width * .11, this.world.height * .08, '', {
                font: 'Pixel Art',
                fontSize: this.QCOUNT_TEXT_SIZE,
                fill: this.QCOUNT_COLOR,
                align: 'center'
            });
        this.qCountText.anchor.setTo(1, .5);

        // Question text
        this.questionText = this.add.text(0, 0, '', {
            font: 'Pixel Art',
            fontSize: this.QUESTION_TEXT_SIZE,
            align: 'center',
            fill: this.QUESTION_COLOR,
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
            wordWrap: true,
            wordWrapWidth: this.QUESTION_BOX.width
        });
        this.questionText.setTextBounds(
            this.QUESTION_BOX.x,
            this.QUESTION_BOX.y,
            this.QUESTION_BOX.width,
            this.QUESTION_BOX.height);

        this.createOptionButtons();

        // Palo sprite
        this.host = this.add.sprite(this.HOST_BOX.x, this.HOST_BOX.y, 'host', 2)
        this.host.width = this.HOST_BOX.width;
        this.host.height = this.HOST_BOX.height;
        this.host.anchor.setTo(0, 0);

        // Palo sprite animations (name, frames, frameRate, loop)
        this.host.animations.add('blink', [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1], 10, true);
        this.host.animations.add('yeah', [2], 10, true);
        this.host.animations.add('wtf', [3,4,4,4,3,3,4,4,4,4], 7, true);
        this.host.animations.add('worries', [5,6,7,8,7,7,8,8,7,7,8,8,7,7,8,7,6,5], 10, true);
        this.host.animations.play('blink');

        this.updateStatus();
    },

    createOptionButtons: function() {
        this.optGroup = this.add.group();
        this.optButtons = new Array();
        this.optLabels = new Array();

        //Label style
        var labelStyle = {
            font: 'Pixel Art',
            fontSize: this.OPTION_TEXT_SIZE,
            fill: this.OPTION_COLOR,
            align: 'center',
            fill: 'white'
        };


        for (var i = 0; i < 4; i++) {
            var xOffset = 0;
            var yOffset = i * this.ANSWERS_BOX.height;

            this.optButtons[i] = this.add.button(
                this.OPTION_BOX.x + xOffset, this.OPTION_BOX.y + yOffset,
                'optionButton', this.actionOnClick, this, 1, 0, 1);
            this.optButtons[i].width = this.OPTION_BOX.width;
            this.optButtons[i].height = this.OPTION_BOX.height;
            this.optButtons[i].anchor.setTo(0, 0)

            this.optLabels[i] = this.add.text(
                this.OPTION_BOX.x + this.OPTION_BOX.width / 2 + xOffset,
                this.OPTION_BOX.y + this.OPTION_BOX.height / 1.8 + yOffset, // 1.8 works better (?)
                '', labelStyle);
            this.optLabels[i].anchor.setTo(0.5, 0.5)

            this.optButtons[i].answerId = i;

            this.optGroup.add(this.optButtons[i]);
            this.optGroup.add(this.optLabels[i]);
        }
    },

    showAnswerMessage: function(buttonId, correct) {
        if (correct) {
            phrase =  this.CORRECT_PHRASES[Math.floor(Math.random() * this.CORRECT_PHRASES.length)];
            this.optButtons[buttonId].setFrames(3, 3, 3);
            this.host.animations.play('yeah');
            this.questionText.fontSize = this.ANSWER_TEXT_SIZE;
            this.questionText.fill = this.ANSWER_OK_COLOR;
            this.questionText.setText(phrase);
        } else {
            phrase = this.WRONG_PHRASES[Math.floor(Math.random() * this.WRONG_PHRASES.length)];
            this.optButtons[buttonId].setFrames(2, 2, 2);
            this.host.animations.play('wtf');
            this.questionText.fontSize = this.ANSWER_TEXT_SIZE;
            this.questionText.fill = this.ANSWER_FAIL_COLOR;
            this.questionText.setText(phrase);
        }

        this.time.events.add(Phaser.Timer.SECOND * 2, function() {
            this.clearQuestion();
            this.host.animations.play('blink');
            this.enableInput(true);
            this.updateStatus();
        }, this);
    },

    clearQuestion: function(){
        this.questionText.setText('');
        this.questionText.fontSize = this.QUESTION_TEXT_SIZE;
        this.questionText.fill = this.QUESTION_COLOR;

        for(var i=0; i<this.optButtons.length; i++){
            this.optButtons[i].setFrames(1, 0, 1);
            this.optButtons[i].frame = 0;
        }

        this.timebarProgress = this.TIMEBAR_BOX.width;
        this.timebarCrop.width = this.timebarProgress;
        this.timebar.updateCrop();
    },

    enableInput: function(enable) {
        this.input.enabled = enable;
    },


    actionOnClick: function(button) {
        this.timebarTween.stop();
        this.enableInput(false);
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

        // var newImage = this.add.image(
        //     this.IMAGE_BOX.x + this.IMAGE_BOX.width / 2,
        //     this.IMAGE_BOX.y + this.IMAGE_BOX.height / 2,
        //     cacheKey);

        // newImage.anchor.setTo(0.5, 0.5);

        // var resScaleW = this.IMAGE_BOX.width / newImage.width;
        // var resScaleH = this.IMAGE_BOX.height / newImage.height;
        // var resScale = Math.min(resScaleW, resScaleH);
        // newImage.width = newImage.width * resScale;
        // newImage.height = newImage.height * resScale;

        // this.questionImage = newImage;
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
                        var count = this.formatNumber(question["question_idx"]+1, 2) + "/" + question["num_questions"];
                        this.qCountText.setText(count);
                        this.questionText.setText(question['question']);
                        this.loadAnswers(question['answers']);
                        this.initTimeBar(question['time'], question['max_time']);
                    }, this);
                });
            }, this);
        } else {
            getJSON('/question', function(question) {
                var count = this.formatNumber(question["question_idx"]+1, 2) + "/" + question["num_questions"];
                this.qCountText.setText(count);
                this.questionText.setText(question['question']);
                this.loadAnswers(question['answers']);
                this.loadQuestionImage(question['img']);
                this.initTimeBar(question['time'], question['max_time']);
            }, this);
        }
    },

    loadAnswers: function(answers) {
        for (var i = 0; i < answers.length; i++) {
            this.optLabels[i].setText(answers[i])
        }
    },

    initTimeBar: function(time, maxTime) {
        this.timebarProgress = this.TIMEBAR_BOX.width * (time / maxTime);
        this.timebarCrop.width = this.timebarProgress;
        this.timebar.updateCrop();

        this.timebarTween = this.add.tween(this);
        this.timebarTween.to({
            timebarProgress: 0
        }, time, null, true, 0, 0);

        this.timebarTween.onUpdateCallback(function () {
            this.timebarCrop.width = this.timebarProgress;
            this.timebar.updateCrop();

            if ((this.timebarCrop.width/this.TIMEBAR_BOX.width) < 0.5){
                this.host.animations.play('worries');
            }

        }, this);
        this.timebarTween.onComplete.add(function() {
            this.enableInput(false);
            this.host.animations.play('wtf');
            phrase = this.TIMEOUT_PHRASES[Math.floor(Math.random() * this.WRONG_PHRASES.length)];
            this.questionText.fontSize = this.ANSWER_TEXT_SIZE;
            this.questionText.fill = this.ANSWER_FAIL_COLOR;
            this.questionText.setText(phrase);

            this.time.events.add(Phaser.Timer.SECOND * 2, function() {
                this.host.animations.play('blink');
                this.clearQuestion();
                this.enableInput(true);

                // call answer with any id  and call updateStatus
                getJSON('/answer/0', function() {
                    this.updateStatus();
                }, this);
            }, this);
        }, this);
    },

    updateStatus: function() {
        getJSON('/status', function(gameStatus) {
            this.scoreText.setText(this.formatNumber(gameStatus['score'], 5));
            if (gameStatus['status'] == 'question') {
                this.loadQuestion(true);
            } else if (gameStatus['status'] == 'answer') {
                this.loadQuestion(false);
            } else {
                this.state.start('Router');
            }
        }, this);

    },


    shutdown: function() {
        // Remove handlers
        this.load.onFileComplete.remove(this.fileComplete, this);


        this.enableInput(true);
    },

    formatNumber: function(number, numberOfdigits){
        var numberStr = number + "";
        var missingNumbers = numberOfdigits - numberStr.length

        for(var i=0; i < missingNumbers ; i++){
            numberStr = "0" + numberStr;
        }
        
        return numberStr;
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
        this.IMAGE_BOX.x = 0;
        this.IMAGE_BOX.y = this.world.height * .0125;
        this.IMAGE_BOX.width = this.world.width;
        this.IMAGE_BOX.height = this.world.height * .376;

        this.DIALOG_PANE_BOX.x = 0;
        this.DIALOG_PANE_BOX.y = this.IMAGE_BOX.y + this.IMAGE_BOX.height * .97;
        this.DIALOG_PANE_BOX.width = this.world.width;
        this.DIALOG_PANE_BOX.height = this.world.height * .184;

        var questionMargin = .15 * this.DIALOG_PANE_BOX.height;
        this.QUESTION_BOX.x = this.DIALOG_PANE_BOX.x + questionMargin;
        this.QUESTION_BOX.y = this.DIALOG_PANE_BOX.y + questionMargin;
        this.QUESTION_BOX.width = this.DIALOG_PANE_BOX.width - 2 * questionMargin;
        this.QUESTION_BOX.height = this.DIALOG_PANE_BOX.height - 2 * questionMargin;

        this.TIMEBAR_BOX.x = this.world.width * .027;
        this.TIMEBAR_BOX.y = this.world.height * .566;
        this.TIMEBAR_BOX.width = this.world.width * .952;
        this.TIMEBAR_BOX.height = this.world.height * .048;

        this.OPTIONS_PANE_BOX.x = 0;
        this.OPTIONS_PANE_BOX.y = this.world.height * .617;
        this.OPTIONS_PANE_BOX.width = this.world.width;
        this.OPTIONS_PANE_BOX.height = this.world.height * .372;

        this.HOST_BOX.x = this.world.width * .684;
        this.HOST_BOX.y = this.world.height * .61;
        this.HOST_BOX.width = this.world.width * .284;
        this.HOST_BOX.height = this.world.height * .378;

        this.ANSWERS_BOX.x = this.world.width * 0.0125;
        this.ANSWERS_BOX.y = this.world.height * .642;
        this.ANSWERS_BOX.width = this.world.width * .71;
        this.ANSWERS_BOX.height = this.world.height * .08125;

        this.OPTION_BOX.x = this.ANSWERS_BOX.x;
        this.OPTION_BOX.y = this.ANSWERS_BOX.y;
        this.OPTION_BOX.width = this.ANSWERS_BOX.width;
        this.OPTION_BOX.height = this.world.height * .067;
    }

};