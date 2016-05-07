
Paloquiz.states.Boot = function (game) {
};

Paloquiz.states.Boot.prototype = {

    init: function () {
        Paloquiz.init();
    },

    preload: function() {
        // Preloader assets
        this.load.image('background', 'assets/graphics/background.png');
        this.load.spritesheet('loadBar', 'assets/load_bar.png', 128, 16);
    },

    update: function () {
        if (Paloquiz.orientated) {
            this.state.start('Preloader');
        }
    }

};
