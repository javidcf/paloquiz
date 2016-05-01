
window.onload = function() {

    var CONTAINER_ID = 'gameContainer';
    container = document.getElementById(CONTAINER_ID);

    var renderer = Phaser.CANVAS;  // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = false;
    var antialias = false;
    var game = new Phaser.Game(container.clientWidth, container.clientHeight,
                               renderer, CONTAINER_ID,
                               { preload: preload, create: create },
                               transparent, antialias);
    // Phaser.Canvas.setImageRenderingCrisp(game.canvas);
    // PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    // Phaser.Canvas.setSmoothingEnabled(game.context, false);

    var qImageHeight = 210

    function preload () {
        game.load.baseURL = '/static/';
        game.load.image('background', 'assets/background.png');
        game.load.spritesheet('host', 'assets/palo.png', 30, 85);
        game.load.image('dialogPane', 'assets/dialog_pane.png');
        game.load.image('optionsPane', 'assets/options_pane.png');
        game.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);
        //game.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');
        game.load.bitmapFont('desyrel', 'assets/desyrel.png', 'assets/desyrel.xml');
    }

    function create () {

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
        scoreText = game.add.text(game.world.centerX + game.world.width/2 - 70, 10, '0', { fill: '#ff8000' });

        //  Progress report
        loadText = game.add.text(game.world.centerX, 50, 'Image', { fill: '#ffffff' });

        //  Bit map Text
        
        //messageText = game.add.bitmapText(200, 100, 'desyrel', 'Phaser & Pixi\nrocking!', 64);
        messageText = game.add.bitmapText(game.world.centerX,game.world.centerY, 'desyrel', 'Correct', 80);
        messageText.inputEnabled = true;
        messageText.anchor.setTo(0.5, 0.5);
        messageText.visible = false


        // Question text
        qTextY = dialogPane.y + dialogPane.height/2
        questionText = game.add.text(game.world.centerX, qTextY, 'Question', { fill: '#ffffff' });
        questionText.anchor.setTo(0.5, 0.5);

        optButtonsGroup = game.add.group();
        optButtons = new Array();

        var bX = optionsPane.x - optionsPane.width * 0.10;
        var bY = optionsPane.y * 1.12 ; 
        var bHeight = (optionsPane.height * 0.8) / 4;
        

        for(var i=0; i < 4; i++){
            optButtons[i] = new LabelButton(game, bX, bY + bHeight*i, "button", "Option", actionOnClick, this, 2, 1, 0); 
            optButtons[i].height = bHeight;
            optButtons[i].width = optionsPane.width * 0.72;
            optButtons[i].answerId = i; 
            optButtonsGroup.add(optButtons[i]);
        }

        getJSON('/start');
        updateStatus();

    }

    function answerCorrect(buttonId){
        messageText.setText("Correct! :)");
        messageText.visible = true;
        enableInput(false);
        game.time.events.add(Phaser.Timer.SECOND*2, function(){
            messageText.visible = false;
            enableInput(true);
        }, this);

    }

    function answerWrong(buttonId){
        messageText.setText("Wrong! >:(");
        messageText.visible = true;
        enableInput(false);
        game.time.events.add(Phaser.Timer.SECOND*2, function(){
            messageText.visible = false;
            enableInput(true);
        }, this);
    }

    function finishGame(){
        messageText.setText("Finish!!! Score = "+ scoreText.text);
        messageText.visible = true;
        enableInput(false);
    }

    function enableInput(enable){
        game.input.disabled = !enable;
    }


    function actionOnClick (button) {
        var answerResponse = getJSON('/answer/'+button.answerId);

        if (answerResponse["correct"]){
            answerCorrect(button.answerId);
        }else{
            answerWrong(button.answerId);
        }


        console.info(answerResponse);
        updateStatus();
    }

    function getJSON(theUrl)
    {
        var xmlHttp = null;
        xmlHttp = new XMLHttpRequest();

        xmlHttp.open('GET', theUrl, false );
        xmlHttp.send( null );

        var response = xmlHttp.responseText;

        if (xmlHttp.status == 200){
            return JSON.parse(response);
        }else{
            try{
                err_response = JSON.parse(response);
                console.error(err_response['message']);
            }catch(e){
                console.error('Unexpected error ('+ xmlHttp.status +')');
            }

            return undefined;
        }
    }

    function loadImage(imageName){

        game.load.image('questionImage', 'questions/' + imageName);
        game.load.start();

    }


    function loadStart() {

        loadText.setText("Loading ...");

    }

    //  This callback is sent the following parameters:
    function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
        loadText.setText("File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles);
        var x = 0;
        var y = 0;

        var newImage = game.add.sprite(x, y, cacheKey);

        newImage.anchor.setTo(0.5, 0.5);
        var realHeight = newImage.height;
        var resScale = realHeight / qImageHeight;

        newImage.height = qImageHeight;
        newImage.width = newImage.width / resScale;

        newImage.x = game.world.centerX
        newImage.y = newImage.height/2 + 5
    }

    function loadComplete() {
        loadText.setText("Loaded");
    }

    function loadQuestion(question){
        //bmpText = game.add.bitmapText(10, 100, 'carrier_command',question,34);
        questionText.setText(question)
    }

    function loadAnswers(answers){
        for(var i=0; i< answers.length; i++){
            optButtons[i].setLabel(answers[i])
        }
    }

    function updateStatus(){
        var gameStatus = getJSON('/status');
        console.debug(gameStatus);


        scoreText.setText(gameStatus['score']);

        if(gameStatus['status']  == 'question'){
            var questionHeader = getJSON('/questionHeader');
            loadImage(questionHeader['img']);
            loadQuestion(questionHeader['question']);

            var question = getJSON('/question');
            loadAnswers(question['answers']);
        }else if (gameStatus['status']  == 'finish'){
            console.info("finish")
            finishGame();
        }
        
    }

    var LabelButton = function(game, x, y, key, label, callback, callbackContext, overFrame, outFrame, downFrame, upFrame){
        Phaser.Button.call(this, game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
        //Label style    
        this.style = { 'font': '18px Arial',        
                       'fill': 'white'};   

        this.anchor.setTo( 0.5, 0.5 );   
        this.label = new Phaser.Text(game, 0, 0, label, this.style);   

        //puts the label in the center of the button    
        this.label.anchor.setTo( 0.5, 0.5 );    
        this.addChild(this.label);    
        this.setLabel( label );    

        //adds button to game    
        game.add.existing( this );
    };

    LabelButton.prototype = Object.create(Phaser.Button.prototype);

    LabelButton.prototype.constructor = LabelButton;

    LabelButton.prototype.setLabel = function( label ) {       
        this.label.setText(label);
    };

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
              break;
            }
        }
    }


};
