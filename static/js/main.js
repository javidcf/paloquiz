Paloquiz.states.Main = function (game) {
    this.optionsPane;
    this.dialogPane;
    this.host;
    this.scoreText;
    this.loadText;
    this.messageText;
    this.questionText;
    this.optButtonsGroup;
    this.optButtons;
};

Paloquiz.states.Main.prototype = {

    QUESTION_IMAGE_MAX_HEIGHT: 0,
    QUESTION_IMAGE_MAX_WIDTH: 0,

    init: function () {
        QUESTION_IMAGE_MAX_HEIGHT = this.game.height * .32;
        QUESTION_IMAGE_MAX_WIDTH = this.game.width * .8;
    },

    preload: function () {
        this.load.baseURL = '/static/';
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('host', 'assets/palo.png', 30, 85);
        this.load.image('dialogPane', 'assets/dialog_pane.png');
        this.load.image('optionsPane', 'assets/options_pane.png');
        this.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);
        //game.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');
        this.load.bitmapFont('desyrel', 'assets/desyrel.png', 'assets/desyrel.xml');

    },

    create: function () {

        var worldCenterX = this.game.world.centerX;
        var worldCenterY = this.game.world.centerY;
        var worldHeight = this.game.world.height;
        var worldWidth = this.game.world.width;

        this.game.stage.background = this.add.sprite(worldCenterX, worldCenterY, 'background');
        this.game.stage.background.anchor.setTo(0.5, 0.5);
        this.game.stage.background.width = this.game.width
        this.game.stage.background.height = this.game.height


        this.optionsPane = this.add.sprite(worldCenterX, worldHeight - 260, 'optionsPane');
        this.optionsPane.anchor.setTo(0.5, 0.0);

        this.dialogPane = this.add.sprite(worldCenterX, 220, 'dialogPane');
        this.dialogPane.anchor.setTo(0.5, 0.0);

        this.host = this.add.sprite(0, 0, 'host');
        // host.smoothed = false;  // does this do something?
        this.host.x = worldWidth - this.host.width / 2 - 55;
        this.host.y = worldHeight - 140;
        this.host.anchor.setTo(0.5, 0.5);
        this.host.scale.setTo(2, 2);


        //  You can listen for each of these events from Phaser.Loader
        this.load.onLoadStart.add(this.loadStart, this);
        this.load.onFileComplete.add(this.fileComplete, this);
        this.load.onLoadComplete.add(this.loadComplete, this);

        // Score text
        this.scoreText = this.add.text(worldCenterX + worldWidth / 2 - 70, 10, '0', {
            fill: '#ff8000'
        });

        //  Progress report
        this.loadText = this.add.text(worldCenterX, 50, 'Image', {
            fill: '#ffffff'
        });

        //  Bit map Text

        //messageText = game.add.bitmapText(200, 100, 'desyrel', 'Phaser & Pixi\nrocking!', 64);
        this.messageText = this.add.bitmapText(worldCenterX, worldCenterY, 'desyrel', 'Correct', 80);
        this.messageText.inputEnabled = true;
        this.messageText.anchor.setTo(0.5, 0.5);
        this.messageText.visible = false


        // Question text
        var qTextY = this.dialogPane.y + this.dialogPane.height / 2
        this.questionText = this.add.text(worldCenterX, qTextY, 'Question', {
            font: 'Pixel Art',
            fontSize: '26px',
            align: 'center',
            fill: '#ffffff'
        });
        this.questionText.anchor.setTo(0.5, 0.5);

        this.createOptionButtons();
        this.updateStatus();
    },

    createOptionButtons: function () {
        this.optButtonsGroup = this.add.group();
        this.optButtons = new Array();

        var bX = this.optionsPane.x - this.optionsPane.width * 0.10;
        var bY = this.optionsPane.y * 1.12;
        var bHeight = (this.optionsPane.height * 0.8) / 4;


        for (var i = 0; i < 4; i++) {
            this.optButtons[i] = new LabelButton(this, bX, bY + bHeight * i, 'button', 'buttont', this.actionOnClick, this, 2, 1, 0);
            this.optButtons[i].height = bHeight;
            this.optButtons[i].width = this.optionsPane.width * 0.72;
            this.optButtons[i].answerId = i;
            this.optButtonsGroup.add(this.optButtons[i]);
        }
    },

    answerCorrect: function (buttonId) {

        this.messageText.setText('Correct! :)');
        this.messageText.visible = true;
        this.enableInput(false);
        this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            this.messageText.visible = false;
            this.enableInput(true);
            this.updateStatus();
        }, this);

    },

    answerWrong: function (buttonId) {
        this.messageText.setText('Wrong! >:(');
        this.messageText.visible = true;
        this.enableInput(false);
        this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            this.messageText.visible = false;
            this.enableInput(true);
            this.updateStatus();
        }, this);
    },

    finishGame: function () {
        this.messageText.setText('Score = ' + this.scoreText.text);
        this.messageText.visible = true;
        this.enableInput(false);
    },

    enableInput: function (enable) {
        this.game.input.disabled = !enable;
    },


    actionOnClick: function (button) {
        getJSON('/answer/' + button.answerId, function(answerResponse) {

            if (answerResponse['correct']) {
                this.answerCorrect(button.answerId);
            } else {
                this.answerWrong(button.answerId);
            }
        }, this);
    },

    loadQuestionImage: function (imageName, callback) {
        this.onQuestionImageLoaded = callback;
        this.load.image('questionImage', 'questions/' + imageName);
        this.load.start();
    },

    loadStart: function () {
        this.loadText.setText('Loading ...');
    },

    //  This callback is sent the following parameters:
    fileComplete: function (progress, cacheKey, success, totalLoaded, totalFiles) {
        this.loadText.setText('File Complete: ' + progress + '% - ' + totalLoaded + ' out of ' + totalFiles);
        if (cacheKey == 'questionImage') {
            this.replaceQuestionImage(cacheKey);
            if (this.onQuestionImageLoaded) {
                this.onQuestionImageLoaded();
            }
        }
    },

    loadComplete: function () {
        this.loadText.setText('Loaded');
    },

    replaceQuestionImage: function (cacheKey) {
        this.clearQuestionImage();

        var newImage = this.add.sprite(0, 0, cacheKey);

        newImage.anchor.setTo(0.5, 0.5);

        var resScaleH = QUESTION_IMAGE_MAX_HEIGHT / newImage.height;
        var resScaleW = QUESTION_IMAGE_MAX_WIDTH / newImage.width;
        var resScale = Math.min(resScaleH, resScaleW);
        newImage.height = newImage.height * resScale;
        newImage.width = newImage.width * resScale;

        newImage.x = this.game.world.centerX;
        newImage.y = newImage.height / 2 + this.game.height * .03;

        this.questionImage = newImage;
    },

    clearQuestionImage: function () {
        if (this.questionImage) {
            this.questionImage.kill();
            this.questionImage = undefined;
        }
    },

    loadQuestion: function (useHeader) {

        this.clearQuestionImage();

        if (useHeader) {
            getJSON('/questionHeader', function(questionHeader) {
                this.questionText.setText(questionHeader['question']);
                this.loadQuestionImage(questionHeader['img'], function() {
                    getJSON('/question', function(question) {
                        this.questionText.setText(question['question']);
                        this.loadAnswers(question['answers']);
                    }, this);
                });
            }, this);
        } else {
            this.onQuestionImageReplaced = undefined;
            getJSON('/question', function(question) {
                this.questionText.setText(question['question']);
                this.loadAnswers(question['answers']);
                this.loadQuestionImage(question['img']);
            }, this);
        }
    },

    loadAnswers: function (answers) {
        for (var i = 0; i < answers.length; i++) {
            this.optButtons[i].setLabel(answers[i])
        }
    },

    updateStatus: function () {
        getJSON('/status', function(gameStatus) {
            this.scoreText.setText(gameStatus['score']);
            if (gameStatus['status'] == 'start') {
                this.startGame();
            } else if (gameStatus['status'] == 'question') {
                this.loadQuestion(true);
            } else if (gameStatus['status'] == 'answer') {
                this.loadQuestion(false);
            } else if (gameStatus['status'] == 'finish') {
                this.finishGame();
            }
        }, this);

    },

    startGame: function () {
        getJSON('/start', this.updateStatus, this);
    }

};


var LabelButton = function(game, x, y, key, label, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {
    Phaser.Button.call(this, game.game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
    //Label style
    this.style = {
        font: 'Pixel Art',
        fontSize: '12px',
        align: 'center',
        fill: 'white'
    };

    this.anchor.setTo(0.5, 0.5);
    this.label = game.add.text(0, 0, label, this.style);

    //puts the label in the center of the button
    this.label.anchor.setTo(0.5, 0.5);
    this.addChild(this.label);
    this.setLabel(label);

    //adds button to game
    game.add.existing(this);
};

LabelButton.prototype = Object.create(Phaser.Button.prototype);

LabelButton.prototype.constructor = LabelButton;

LabelButton.prototype.setLabel = function(label) {
    this.label.setText(label);
};

