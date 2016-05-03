Paloquiz.states.Preloader = function(game) {
    this.preloadBar;
    this.preloadBarCrop;
    this.preloadBarMaxWidth = 0;
}

Paloquiz.states.Preloader.prototype = {

    preloadFiles: function() {
        // Start
        this.load.spritesheet('startButton', 'assets/button_sprite_sheet.png', 189, 66);

        // Main
        this.load.spritesheet('host', 'assets/palo.png', 30, 85);
        this.load.image('dialogPane', 'assets/dialog_pane.png');
        this.load.image('optionsPane', 'assets/options_pane.png');
        this.load.spritesheet('button', 'assets/button_sprite_sheet.png', 189, 66);

        // Highscores
        this.load.image('noface', 'assets/noface.png');
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('back', 'assets/back.png');
    },

    init: function() {},

    preload: function() {
        // Base URL for the loader
        this.load.baseURL = '/static/';

        // Enable cross-origin image loading
        this.load.crossOrigin = 'anonymous';

        // Preloader assets
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('loadBar', 'assets/load_bar.png', 128, 16);
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
    },

    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        this.preloadBarCrop.width = this.preloadBarMaxWidth * (progress / 100.0);
        this.preloadBar.updateCrop();
    },

    loadComplete: function() {
        // Preloaded
        getJSON('/status', function(gameStatus) {
            if (gameStatus['status'] == 'start') {
                this.state.start('Start');
            } else {
                this.state.start('Main');
            }
        }, this);
    },

    createPreloaderElements: function() {
        var background = this.add.image(
            this.game.world.centerX, this.game.world.centerY, 'background');
        background.anchor.setTo(.5, .5);
        background.width = this.game.width;
        background.height = this.game.height;

        var loadingText = this.add.text(
            this.game.world.centerX, this.game.world.centerY, 'Cargando...', {
                font: 'Pixel Art',
                fontSize: '40px',
                fill: 'white',
                align: 'center',
            });
        loadingText.anchor.setTo(.5, 1);

        var smallDim = Math.min(this.game.world.width, this.game.world.height);
        var preloadBarHeight = .2 * smallDim;
        this.preloadBarMaxWidth = .8 * smallDim;

        var preloadBase = this.add.image(
            this.game.world.centerX, this.game.world.centerY, 'loadBar', 0);
        preloadBase.anchor.setTo(.5, 0);
        preloadBase.height = preloadBarHeight;
        preloadBase.width = this.preloadBarMaxWidth;

        this.preloadBar = this.add.image(
            this.game.world.centerX, this.game.world.centerY, 'loadBar', 1);
        this.preloadBar.anchor.setTo(.5, 0);
        this.preloadBar.height = preloadBarHeight;
        this.preloadBar.width = this.preloadBarMaxWidth;
        this.preloadBarCrop = new Phaser.Rectangle(0, 0, 0, preloadBarHeight);
        this.preloadBar.crop(this.preloadBarCrop);
    }
}