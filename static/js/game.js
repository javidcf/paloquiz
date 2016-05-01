
window.onload = function() {

    var renderer = Phaser.CANVAS;  // Phaser.CANVAS / Phaser.WEBGL / Phaser.AUTO
    var transparent = false;
    var antialias = false;
    var game = new Phaser.Game(480, 640, renderer, '',
                               { preload: preload, create: create },
                               transparent, antialias);

    var qImageHeight = 210
    // Phaser.Canvas.setImageRenderingCrisp(game.canvas);
    // PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    // Phaser.Canvas.setSmoothingEnabled(game.context, false);

    function preload () {
        game.load.baseURL = '/static/';
        game.load.image('background', 'assets/background.png');
        game.load.spritesheet('host', 'assets/palo.png', 30, 85);
        game.load.image('dialogPane', 'assets/dialog_pane.png');
        game.load.image('optionsPane', 'assets/options_pane.png');
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

        //  Progress report
        text = game.add.text(game.world.centerX, 50, 'Image', { fill: '#ffffff' });

        getJSON('/start');
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
        console.debug("Loading "+ imageName + "...");

        game.load.image('questionImage', 'questions/' + imageName);
        game.load.start();

    }


    function loadStart() {

        text.setText("Loading ...");

    }

    //  This callback is sent the following parameters:
    function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {

        text.setText("File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles);

        x = 0;
        y = 0;

        newImage = game.add.sprite(x, y, cacheKey);

        newImage.anchor.setTo(0.5, 0.5);
        realHeight = newImage.height;
        resScale = realHeight / qImageHeight;

        newImage.height = qImageHeight;
        newImage.width = newImage.width / resScale;

        newImage.x = game.world.centerX
        newImage.y = newImage.height/2 + 5

    }

    function loadComplete() {
        text.setText("Loaded");
    }

    function loadQuestion(question){
        //bmpText = game.add.bitmapText(10, 100, 'carrier_command',question,34);

    }

    function updateStatus(){
        var gameStatus = getJSON('/status');
        console.debug(gameStatus);

        if(gameStatus['status'] == 'question'){
            var questionHeader = getJSON('/questionHeader');
            loadImage(questionHeader['img']);
            loadQuestion(questionHeader['question']);
            


            var question = getJSON('/question');
            console.debug(question);

        }

        
    }


};
