Paloquiz.states.Highscores = function(game) {
    this.currentPage = 0;
    this.scores = [];
    this.friendsScores = [];
    this.userPos = undefined;
    this.profileImagesData = [];
    this.numFriendsInPage = 0;
};

Paloquiz.states.Highscores.prototype = {

    PAGE_SIZE: 5,
    HIGHSCORE_REGION_WIDTH: 0,
    HIGHSCORE_REGION_HEIGHT: 0,
    HIGHSCORE_IMAGE_SIZE: 0,

    init: function() {
        this.HIGHSCORE_REGION_WIDTH = this.game.width * .8;
        this.HIGHSCORE_REGION_HEIGHT = this.game.height * .8;

        this.HIGHSCORE_IMAGE_SIZE = .8 * Math.min(this.HIGHSCORE_REGION_WIDTH * .25,
            this.HIGHSCORE_REGION_HEIGHT / this.PAGE_SIZE);
    },

    preload: function() {
        this.load.image('noface', 'assets/noface.png');
    },

    create: function() {
        // Set up background
        var background = this.add.image(this.game.world.centerX, this.game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.width = this.game.width;
        background.height = this.game.height;

        // Create game objects
        var nameTextStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'left',
            fill: 'white'
        }
        var scoreTextStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'center',
            fill: 'white'
        }
        for (var i = 0; i < this.PAGE_SIZE; i++) {
            // Y baseline
            var y = this.game.world.centerY - (this.HIGHSCORE_REGION_HEIGHT / 2) +
                (i + .5) * (this.HIGHSCORE_REGION_HEIGHT / this.PAGE_SIZE);
            // Image occupies the first 25% in X dimension
            var img = this.add.image(this.game.world.centerX - this.HIGHSCORE_REGION_WIDTH * .375,
                y, 'noface');
            img.anchor.setTo(.5, .5);
            img.width = this.HIGHSCORE_IMAGE_SIZE;
            img.height = this.HIGHSCORE_IMAGE_SIZE;
            img.visible = false;
            // Name goes after image
            var name = this.add.text(this.game.world.centerX - this.HIGHSCORE_REGION_WIDTH * .25, y,
                '', nameTextStyle);
            name.anchor.setTo(0, .5);
            name.visible = false;
            // Score goes at the end
            var score = this.add.text(this.game.world.centerX + this.HIGHSCORE_REGION_WIDTH * .375, y,
                '', scoreTextStyle);
            score.anchor.setTo(.5, .5);
            score.visible = false;
            this.scores.push({
                img: img,
                name: name,
                score: score
            });
        }

        // Handler for loaded profile pictures
        this.load.onLoadComplete.add(this.loadComplete, this);

        // Exit if not logged in
        if (fbIsLoggedIn()) {
            this.state.start('Main');
            return;
        }
        fbGetFriendsScores(function(friendsScores, userPos) {
            this.friendsScores = friendsScores;
            this.userPos = userPos;
            this.loadScoresPage();
        }, this);
    },

    shutdown: function() {
        // Remove handlers
        this.load.onLoadComplete.remove(loadComplete, this);
    },

    loadComplete: function() {
        for (var i = 0; i < this.numFriendsInPage; i++) {
            if (!this.profileImagesData[i].isSilhouette) {
                this.scores[i].img.loadTexture(i);
            }
            this.scores[i].img.visible = true;
        }
    },

    loadScoresPage: function() {
        // Hide all
        this.scores.forEach(function(s) {
            s.img.loadTexture('noface');
            s.img.visible = false;
            s.name.visible = false;
            s.score.visible = false;
        });

        // Count friends in page
        var iFriendStart = this.PAGE_SIZE * this.currentPage;
        var iFriendEnd = Math.min(this.PAGE_SIZE * (this.currentPage + 1), this.friendsScores.length);
        this.numFriendsInPage = iFriendEnd - iFriendStart;
        this.profileImagesData = new Array(this.numFriendsInPage);

        // Function that starts the loader after every friend information is read
        var readFriends = 0;
        var friendInformationRead = function() {
            readFriends++;
            if (readFriends >= this.numFriendsInPage) {
                this.profileImagesData.forEach(function(img, i) {
                    this.load.image(i, img.url);
                });
                this.load.start();
            }
        }

        // Iterate through friends
        for (var iFriend = iFriendStart, iScore = 0; iFriend < iFriendEnd; iFriend++, iScore++) {
            // Copy index to use in closure
            var idx = iFriend;
            fbGetProfileDetails(this.friendsScores[iFriend].user.id, function(friend) {
                this.scores[iScore].name.setText(friend.first_name || friend.name);
                this.scores[iScore].name.visible = true;
                this.scores[iScore].score.setText(this.friendsScores[idx].score);
                this.scores[iScore].score.visible = true;
                this.profileImagesData[iScore] = friend.image;
                friendInformationRead();
            }, this);
        }
    }

};