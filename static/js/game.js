window.onload = function() {

    var CONTAINER_ID = 'gameContainer';
    container = document.getElementById(CONTAINER_ID);

    var renderer = Phaser.AUTO; // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = false;
    var antialias = false;
    game = new Phaser.Game(container.clientWidth, container.clientHeight,
        renderer, CONTAINER_ID, {
            init: init,
            preload: preload,
            create: create
        },
        transparent, antialias);

    var QUESTION_IMAGE_MAX_HEIGHT = game.height * .32;
    var QUESTION_IMAGE_MAX_WIDTH = game.width * .8;

    function init() {
        fbInit();

        // Does this do something?
        PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
        if (game.renderType == Phaser.CANVAS) {
            Phaser.Canvas.setImageRenderingCrisp(game.canvas);
            Phaser.Canvas.setSmoothingEnabled(game.context, false);
        }
    }

    function preload() {
        game.load.baseURL = '/static/';
        game.load.image('background', 'assets/background.png');
        game.load.spritesheet('host', 'assets/palo.png', 30, 85);
        game.load.image('dialogPane', 'assets/dialog_pane.png');
        game.load.image('optionsPane', 'assets/options_pane.png');
        game.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);
        //game.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');
        game.load.bitmapFont('desyrel', 'assets/desyrel.png', 'assets/desyrel.xml');
    }

    function create() {

        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.scale.setTo(2, 2);

        var optionsPane = game.add.sprite(game.world.centerX, game.world.height - 260, 'optionsPane');
        optionsPane.anchor.setTo(0.5, 0.0);

        var dialogPane = game.add.sprite(game.world.centerX, 220, 'dialogPane');
        dialogPane.anchor.setTo(0.5, 0.0);

        var host = game.add.sprite(0, 0, 'host');
        // host.smoothed = false;  // does this do something?
        host.x = game.world.width - host.width / 2 - 55;
        host.y = game.world.height - 140;
        host.anchor.setTo(0.5, 0.5);
        host.scale.setTo(2, 2);


        //  You can listen for each of these events from Phaser.Loader
        game.load.onLoadStart.add(loadStart, this);
        game.load.onFileComplete.add(fileComplete, this);
        game.load.onLoadComplete.add(loadComplete, this);

        // Score text
        scoreText = game.add.text(game.world.centerX + game.world.width / 2 - 70, 10, '0', {
            fill: '#ff8000'
        });

        //  Progress report
        loadText = game.add.text(game.world.centerX, 50, 'Image', {
            fill: '#ffffff'
        });

        //  Bit map Text

        //messageText = game.add.bitmapText(200, 100, 'desyrel', 'Phaser & Pixi\nrocking!', 64);
        messageText = game.add.bitmapText(game.world.centerX, game.world.centerY, 'desyrel', 'Correct', 80);
        messageText.inputEnabled = true;
        messageText.anchor.setTo(0.5, 0.5);
        messageText.visible = false


        // Question text
        qTextY = dialogPane.y + dialogPane.height / 2
        questionText = game.add.text(game.world.centerX, qTextY, 'Question', {
            font: 'Pixel Art',
            fontSize: '26px',
            align: 'center',
            fill: '#ffffff'
        });
        questionText.anchor.setTo(0.5, 0.5);

        optButtonsGroup = game.add.group();
        optButtons = new Array();

        var bX = optionsPane.x - optionsPane.width * 0.10;
        var bY = optionsPane.y * 1.12;
        var bHeight = (optionsPane.height * 0.8) / 4;


        for (var i = 0; i < 4; i++) {
            optButtons[i] = new LabelButton(game, bX, bY + bHeight * i, 'button', 'Option', actionOnClick, this, 2, 1, 0);
            optButtons[i].height = bHeight;
            optButtons[i].width = optionsPane.width * 0.72;
            optButtons[i].answerId = i;
            optButtonsGroup.add(optButtons[i]);
        }

        updateStatus();

    }

    function answerCorrect(buttonId) {
        messageText.setText('Correct! :)');
        messageText.visible = true;
        enableInput(false);
        game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            messageText.visible = false;
            enableInput(true);
            updateStatus();
        }, this);

    }

    function answerWrong(buttonId) {
        messageText.setText('Wrong! >:(');
        messageText.visible = true;
        enableInput(false);
        game.time.events.add(Phaser.Timer.SECOND * 2, function() {
            messageText.visible = false;
            enableInput(true);
            updateStatus();
        }, this);
    }

    function finishGame() {
        messageText.setText('Score = ' + scoreText.text);
        messageText.visible = true;
        enableInput(false);
    }

    function enableInput(enable) {
        game.input.disabled = !enable;
    }


    function actionOnClick(button) {
        getJSON('/answer/' + button.answerId, function(answerResponse) {

            if (answerResponse['correct']) {
                answerCorrect(button.answerId);
            } else {
                answerWrong(button.answerId);
            }
        });
    }

    function loadQuestionImage(imageName) {

        game.load.image('questionImage', 'questions/' + imageName);
        game.load.start();
    }

    function loadStart() {
        loadText.setText('Loading ...');
    }

    //  This callback is sent the following parameters:
    function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
        loadText.setText('File Complete: ' + progress + '% - ' + totalLoaded + ' out of ' + totalFiles);
        if (cacheKey == 'questionImage') {
            replaceQuestionImage(cacheKey);
        }
    }

    function loadComplete() {
        loadText.setText('Loaded');
    }

    function replaceQuestionImage(cacheKey) {
        clearQuestionImage();

        var newImage = game.add.sprite(0, 0, cacheKey);

        newImage.anchor.setTo(0.5, 0.5);

        var resScaleH = QUESTION_IMAGE_MAX_HEIGHT / newImage.height;
        var resScaleW = QUESTION_IMAGE_MAX_WIDTH / newImage.width;
        var resScale = Math.min(resScaleH, resScaleW);
        newImage.height = newImage.height * resScale;
        newImage.width = newImage.width * resScale;

        newImage.x = game.world.centerX;
        newImage.y = newImage.height / 2 + game.height * .03;

        game.questionImage = newImage;

        if (game.onQuestionImageReplaced) {
            game.onQuestionImageReplaced();
        }
    }

    function clearQuestionImage() {
        if (game.questionImage) {
            game.questionImage.kill();
            game.questionImage = undefined;
        }
    }

    function loadQuestion(useHeader) {

        clearQuestionImage();

        if (useHeader) {
            game.onQuestionImageReplaced = function() {
                getJSON('/question', function(question) {
                    questionText.setText(question['question']);
                    loadAnswers(question['answers']);
                });
            }
            getJSON('/questionHeader', function(questionHeader) {
                // questionText.setText(questionHeader['question']);
                loadQuestionImage(questionHeader['img']);
            });
        } else {
            game.onQuestionImageReplaced = undefined;
            getJSON('/question', function(question) {
                questionText.setText(question['question']);
                loadAnswers(question['answers']);
                loadQuestionImage(question['img']);
            });
        }
    }

    function loadAnswers(answers) {
        for (var i = 0; i < answers.length; i++) {
            optButtons[i].setLabel(answers[i])
        }
    }

    function updateStatus() {
        getJSON('/status', function(gameStatus) {
            scoreText.setText(gameStatus['score']);
            if (gameStatus['status'] == 'start') {
                startGame();
            } else if (gameStatus['status'] == 'question') {
                loadQuestion(true);
            } else if (gameStatus['status'] == 'answer') {
                loadQuestion(false);
            } else if (gameStatus['status'] == 'finish') {
                finishGame();
            }
        });

    }

    function startGame() {
        getJSON('/start', updateStatus);
    }

    var LabelButton = function(game, x, y, key, label, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {
        Phaser.Button.call(this, game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
        //Label style
        this.style = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'center',
            fill: 'white'
        };

        this.anchor.setTo(0.5, 0.5);
        this.label = new Phaser.Text(game, 0, 0, label, this.style);

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

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

};