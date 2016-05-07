Paloquiz.states.Preloader = function(game) {
    this.preloadBase;
    this.preloadBar;
    this.preloadBarCrop;
}

Paloquiz.states.Preloader.prototype = {

    preloadFiles: function() {
        // Start
        this.load.spritesheet('startButton', 'assets/graphics/question-button.png', 465, 75);
        this.load.spritesheet('fbButton', 'assets/graphics/fb-button.png', 64, 64);
        this.load.spritesheet('hiscoresButton', 'assets/graphics/highscores-button.png', 64, 64);
        this.load.image('logo', 'assets/graphics/logo.png');

        // Main
        this.load.spritesheet('host', 'assets/graphics/palo-sm.png', 188, 375);
        // this.load.spritesheet('host', 'assets/graphics/palo-md.png', 375, 750);
        // this.load.spritesheet('host', 'assets/graphics/palo-xl.png', 750, 1500);
        this.load.image('imageFrame', 'assets/graphics/frame.png');
        this.load.image('imageMask', 'assets/graphics/question-image-mask.png');
        this.load.image('dialogPane', 'assets/graphics/question.png');
        this.load.image('optionsPane', 'assets/graphics/answers.png');
        this.load.spritesheet('optionButton', 'assets/graphics/question-button.png', 465, 75);
        this.load.spritesheet('exitButton', 'assets/graphics/close-button.png', 64, 64);
        this.load.spritesheet('timebar', 'assets/graphics/timebar.png', 609, 46);

        // Highscores
        this.load.image('noface', 'assets/noface.png');
        this.load.spritesheet('arrowLeft', 'assets/graphics/left-button.png', 64, 64);
        this.load.spritesheet('arrowRight', 'assets/graphics/right-button.png', 64, 64);
        this.load.spritesheet('highscoreBackground', 'assets/graphics/question-button.png', 465, 75);

        // Percentage stars
        this.load.spritesheet('star', 'assets/graphics/star.png', 195, 198);

        // Finish
        this.load.spritesheet('finishButton', 'assets/graphics/question-button.png', 465, 75);
    },

    create: function() {
        this.input.enabled = false;
        this.createPreloaderElements();

        this.time.events.add(0, function() {
            // Set files to preload
            this.preloadFiles();

            // Assign handlers
            this.load.onLoadStart.add(this.loadStart, this);
            this.load.onFileComplete.add(this.fileComplete, this);
            this.load.onLoadComplete.add(this.loadComplete, this);

            // Do preload
            this.load.start();
        }, this);
    },

    shutdown: function() {
        this.load.onLoadStart.remove(this.loadStart, this);
        this.load.onFileComplete.remove(this.fileComplete, this);
        this.load.onLoadComplete.remove(this.loadComplete, this);

        this.input.enabled = true;
    },

    loadStart: function() {
        // Crop rectangle works with non-scaled coordinates >:(
        this.preloadBarCrop = new Phaser.Rectangle(0, 0, 0, this.preloadBase.texture.height);
        this.preloadBar.crop(this.preloadBarCrop);
        this.preloadBar.visible = true;
    },

    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        this.preloadBarCrop.width = this.preloadBase.texture.width * (progress / 100.0);
        this.preloadBar.updateCrop();
    },

    loadComplete: function() {
        // Preloaded
        this.preloadBarCrop.width = this.preloadBase.texture.width;
        this.preloadBar.updateCrop();
        this.state.start('Router');
    },

    createPreloaderElements: function() {

        var loadingText = this.add.text(
            this.world.centerX, this.world.height * .48, 'Cargando...', {
                font: 'Pixel Art',
                fontSize: '50px',
                fill: 'white',
                align: 'center',
            });
        loadingText.anchor.setTo(.5, 1);

        this.preloadBase = this.add.image(0, 0, 'loadBar', 1);
        this.preloadBase.width = .8 * this.world.width;
        this.preloadBase.height = this.preloadBase.width / 12;
        this.preloadBase.x = this.world.centerX - this.preloadBase.width / 2;
        this.preloadBase.y = this.world.height * .5;
        this.preloadBase.anchor.setTo(0, 0);

        this.preloadBar = this.add.image(this.preloadBase.x, this.preloadBase.y, 'loadBar', 0);
        this.preloadBar.width = this.preloadBase.width;
        this.preloadBar.height = this.preloadBase.height;
        this.preloadBar.anchor.setTo(0, 0);
        this.preloadBar.visible = false;
    }
}