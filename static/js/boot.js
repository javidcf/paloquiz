
Paloquiz.states.Boot = function (game) {
};

Paloquiz.states.Boot.prototype = {

    init: function () {
        Paloquiz.init();
    },

    preload: function() {
        // Preloader assets
        this.load.image('background', 'assets/graphics/background.png');
        this.load.spritesheet('loadBar', 'assets/graphics/load-bar.png', 609, 46);
    },

    update: function () {
        if (Paloquiz.orientated) {
            this.state.start('Preloader');
        }
    }

};
