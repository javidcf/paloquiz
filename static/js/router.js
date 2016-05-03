
Paloquiz.states.Router = function(game) {
}

Paloquiz.states.Router.prototype = {

    nextStatus: function (gameStatus) {
        if (gameStatus['status'] == 'start') {
            this.state.start('Start');
        } else if (gameStatus['status'] == 'question') {
            this.state.start('Main');
        } else if (gameStatus['status'] == 'answer') {
            this.state.start('Main');
        } else if (gameStatus['status'] == 'finish') {
            this.state.start('Main');
        }
    },

    create: function() {
        this.input.enabled = false;
        getJSON('/status', this.nextStatus, this);
    },

    shutdown: function() {
        this.input.enabled = true;
    }

}
