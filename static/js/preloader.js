Paloquiz.states.Preloader = function(game) {
    this.preloadBar;
    this.preloadBarCrop;
    this.preloadBarMaxWidth = 0;
}

Paloquiz.states.Preloader.prototype = {

    preloadFiles: function() {
        // Start
        this.load.spritesheet('startButton', 'assets/button_sprite_sheet.png', 189, 66);
        this.load.spritesheet('fbButton', 'assets/fb.png', 32, 32);
        this.load.spritesheet('hiscoresButton', 'assets/star_button.png', 16, 16);

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

    init: function() {
        this.stage.disableVisibilityChange = true;

        this.input.onDown(Paloquiz.goFullscreen);
    },

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
        this.state.start('Router');
    },

    createPreloaderElements: function() {
        Paloquiz.setupBackground();

        var loadingText = this.add.text(
            this.game.world.centerX, this.game.world.centerY, 'Cargando...', {
                font: 'Pixel Art',
                fontSize: '40px',
                fill: 'white',
                align: 'center',
            });
        loadingText.anchor.setTo(.5, 1);

        var smallDim = Math.min(this.game.world.width, this.game.world.height);
        var preloadBarHeight = .1 * smallDim;
        this.preloadBarMaxWidth = .8 * smallDim;

        var preloadBase = this.add.image(0, 0, 'loadBar', 0);
        preloadBase.anchor.setTo(0, 0);
        preloadBase.height = preloadBarHeight;
        preloadBase.width = this.preloadBarMaxWidth;
        preloadBase.x = this.game.world.centerX - preloadBase.width / 2;
        preloadBase.y = this.game.world.centerY;

        this.preloadBar = this.add.image(0, 0, 'loadBar', 1);
        this.preloadBar.anchor.setTo(0, 0);
        this.preloadBar.height = preloadBarHeight;
        this.preloadBar.width = this.preloadBarMaxWidth;
        this.preloadBar.x = this.game.world.centerX - this.preloadBar.width / 2;
        this.preloadBar.y = this.game.world.centerY;

        this.preloadBarCrop = new Phaser.Rectangle(0, 0, 0, preloadBarHeight);
        this.preloadBar.crop(this.preloadBarCrop);
    }
}