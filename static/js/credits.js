Paloquiz.states.Credits = function(game) {
    this.score = 0;
}

Paloquiz.states.Credits.prototype = {
    create: function() {
        // Exit button
        var exitButton = this.add.button(0, 0, 'exitButton',
            function() {
                getJSON('/status', function (gameStatus) {
                    if (gameStatus['status'] === 'finish') {
                        this.state.start('Finish');
                    } else  {
                        this.state.start('Router');
                    }
                }, this)
            }, this, 1, 0, 1);
        var backButtonSize = .1 * Math.min(this.world.width, this.world.height);
        exitButton.width = backButtonSize;
        exitButton.height = backButtonSize;
        exitButton.anchor.setTo(1, 0);
        exitButton.x = this.world.width - exitButton.width * .2;
        exitButton.y = exitButton.height * .2;

        // Text styles
        var headerSize = Math.round(this.world.height / 20);
        var headerStyle = {
            font: 'Pixel Art',
            fontSize: headerSize + 'px',
            align: 'center',
            fill: 'white'
        };
        var creditSize = Math.round(this.world.height / 15);
        var creditStyle = {
            font: 'Pixel Art',
            fontSize: creditSize + 'px',
            align: 'center',
            fill: 'white'
        };
        var headerCreditOffset = this.world.height * .07;

        var headerSize2 = Math.round(this.world.height / 38);
        var headerStyle2 = {
            font: 'Pixel Art',
            fontSize: headerSize2 + 'px',
            align: 'center',
            fill: 'white'
        };
        var creditSize2 = Math.round(this.world.height / 30);
        var creditStyle2 = {
            font: 'Pixel Art',
            fontSize: creditSize2 + 'px',
            align: 'center',
            fill: 'white'
        };
        var headerCreditOffset2 = this.world.height * .05;

        // Text
        var prog = this.add.text(this.world.centerX, this.world.height * .14,
            'Programación', headerStyle);
        prog.anchor.setTo(.5, 0);
        var jyk = this.add.text(this.world.centerX, prog.y + headerCreditOffset,
            'Javi & Karem', creditStyle);
        jyk.anchor.setTo(.5, 0);

        var art = this.add.text(this.world.centerX, this.world.height * .33,
            'Arte', headerStyle);
        art.anchor.setTo(.5, 0);
        var will = this.add.text(this.world.centerX, art.y + headerCreditOffset,
            'Guille', creditStyle);
        will.anchor.setTo(.5, 0);

        var help = this.add.text(this.world.centerX, this.world.height * .56,
            'Con la ayuda de', headerStyle2);
        help.anchor.setTo(.5, 0);
        var helpers = this.add.text(this.world.centerX, help.y + headerCreditOffset2,
            'Madre y padre\nElena', creditStyle2);
        helpers.anchor.setTo(.5, 0);

        var thanks = this.add.text(this.world.centerX, this.world.height * .76,
            'Agradecimientos', headerStyle2);
        thanks.anchor.setTo(.5, 0);
        var helpers = this.add.text(this.world.centerX, thanks.y + headerCreditOffset2,
            'Photon Storm\nAnastasia Dimitriadi', creditStyle2);
        helpers.anchor.setTo(.5, 0);
    }
}