Paloquiz.states.Main = function (game) {
    this.optionsPane;
    this.dialogPane;
    this.host;
    this.scoreText;
    this.loadText;
    this.messageText;
    this.questionText;
    this.timebar;
    this.timebarTween;
    this.barProgress;
    this.optGroup;
    this.optButtons;
    this.optLabels;
};

Paloquiz.states.Main.prototype = {

    QUESTION_IMAGE_MAX_HEIGHT: 0,
    QUESTION_IMAGE_MAX_WIDTH: 0,
    TIMEBAR_OK_COLOR: '#0f0',

    init: function () {
        this.QUESTION_IMAGE_MAX_HEIGHT = this.game.height * .32;
        this.QUESTION_IMAGE_MAX_WIDTH = this.game.width * .8;
    },

    preload: function () {
        this.load.baseURL = '/static/';
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('host', 'assets/palo.png', 30, 85);
        this.load.image('dialogPane', 'assets/dialog_pane.png');
        this.load.image('optionsPane', 'assets/options_pane.png');
        this.load.spritesheet('button', 'assets/button_sprite_sheet.png', 189, 66);
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

        //  var bar = this.add.bitmapData(300, 200);
        this.timebar = this.add.bitmapData(this.optionsPane.width, 8);
        var timebarSprite = this.add.sprite(worldCenterX, worldHeight - 269, this.timebar);
        timebarSprite.anchor.setTo(0.5, 0.0);
        
        this.timebar.context.fillStyle = this.TIMEBAR_OK_COLOR;
        this.timebar.context.fillRect(0, 0, this.optionsPane.width, 8);
        this.barProgress = this.optionsPane.width;

        this.host = this.add.sprite(0, 0, 'host');
        this.host.smoothed = false;
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

        var bX = this.optionsPane.x - this.optionsPane.width * 0.10;
        var bY = this.optionsPane.y * 1.12;
        var bHeight = (this.optionsPane.height * 0.8) / 4;


        for (var i = 0; i < 4; i++) {
            this.optButtons[i] = this.add.button(bX, bY + bHeight * i, 'button', this.actionOnClick, this, 2, 1, 0);
            this.optButtons[i].height = bHeight;
            this.optButtons[i].width = this.optionsPane.width * 0.72;
            this.optButtons[i].anchor.setTo(0.5, 0.5)

            this.optButtons[i].answerId = i;

            this.optLabels[i] = this.add.text(bX, bY + bHeight * i, 'Option', labelStyle);
            this.optLabels[i].anchor.setTo(0.5, 0.5)

            this.optGroup.add(this.optButtons[i]);
            this.optGroup.add(this.optLabels[i]);
        }
    },

    showAnswerMessage: function (buttonId, correct) {
        if(correct){
            this.optButtons[buttonId].setFrames(3, 3, 3);
            this.messageText.setText('Correct! :)');
        }else{
            this.optButtons[buttonId].setFrames(4, 4, 4);
            this.messageText.setText('Wrong! >:(');
        }

        this.messageText.visible = true;
        this.enableInput(false);
        this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            this.messageText.visible = false;
            this.enableInput(true);
            this.optButtons[buttonId].setFrames(2, 1, 0);
            this.barProgress = this.optionsPane.width; 
            this.updateStatus();
        }, this);
    },

    finishGame: function () {
        this.messageText.setText('Score = ' + this.scoreText.text);
        this.messageText.visible = true;
        this.enableInput(false);
    },

    enableInput: function (enable) {
        this.game.input.enabled = enable;
    },


    actionOnClick: function (button) {
        this.timebarTween.stop();
        getJSON('/answer/' + button.answerId, function(answerResponse) {

            if (answerResponse['correct']) {
                this.showAnswerMessage(button.answerId, true);
            } else {
                this.showAnswerMessage(button.answerId, false);
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

        var resScaleH = this.QUESTION_IMAGE_MAX_HEIGHT / newImage.height;
        var resScaleW = this.QUESTION_IMAGE_MAX_WIDTH / newImage.width;
        var resScale = Math.min(resScaleH, resScaleW);
        newImage.height = newImage.height * resScale;
        newImage.width = newImage.width * resScale;

        newImage.x = this.game.world.centerX;
        newImage.y = newImage.height / 2 + this.game.height * .02;

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
                        this.initTimeBar(question['max_time'], question['time']);
                    }, this);
                });
            }, this);
        } else {
            this.onQuestionImageReplaced = undefined;
            getJSON('/question', function(question) {
                this.questionText.setText(question['question']);
                this.loadAnswers(question['answers']);
                this.loadQuestionImage(question['img']);
                this.initTimeBar(question['max_time'], question['time']);
            }, this);
        }
    },

    loadAnswers: function (answers) {
        for (var i = 0; i < answers.length; i++) {
            this.optLabels[i].setText(answers[i])
        }
    },

    initTimeBar: function(time, maxTime){
        this.barProgress = time * this.optionsPane.width / maxTime;

        this.timebarTween = this.add.tween(this);
        this.timebarTween.to({barProgress: 0}, time, null, true, 0, 0);

        this.timebarTween.onUpdateCallback(this.updateTimebar, this);
        this.timebarTween.onComplete.add(function () {
            this.messageText.setText('Time Out! :S');
            this.messageText.visible = true;
            this.enableInput(false);
            this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
                this.messageText.visible = false;
                this.enableInput(true);
                this.barProgress = this.optionsPane.width; 

                // call answer with any id  and call updateStatus
                getJSON('/answer/0', function() {
                    this.updateStatus();
                }, this);
            }, this);
        }, this);
    },

    updateTimebar: function(){
        // ensure you clear the context each time you update it or the bar will draw on top of itself
        this.timebar.context.clearRect(0, 0, this.timebar.width, this.timebar.height);
        
        // 25%  = warning
        if (this.barProgress < this.timebar.width * 0.25) {
           this.timebar.context.fillStyle = '#f00';   
        }
        // 50%  = warning
        else if (this.barProgress < this.timebar.width * 0.5) {
            this.timebar.context.fillStyle = '#ff0';
        }
        else {
            this.timebar.context.fillStyle = this.TIMEBAR_OK_COLOR;
        }
        
        // draw the bar
        this.timebar.context.fillRect(0, 0, this.barProgress, 8);
        
        // important - without this line, the context will never be updated on the GPU when using webGL
        this.timebar.dirty = true;
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

    shutdown: function() {
        // Remove handlers
        this.load.onLoadStart.remove(this.loadStart, this);
        this.load.onFileComplete.remove(this.fileComplete, this);
        this.load.onLoadComplete.remove(this.loadComplete, this);


        this.enableInput(true);
    },

};