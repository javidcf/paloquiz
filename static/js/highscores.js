
Paloquiz.states.Highscores = function(game) {
    this.currentPage = 0;
    this.friendsScores = [];
    this.userPos = undefined;
    this.profileImagesData = [];
    this.numFriendsInPage = 0;
    this.maxPage = 0;

    this.scores = [];
    this.nameTextStyle;
    this.scoreTextStyle;
    this.nameUserTextStyle;
    this.scoreUserTextStyle;
    this.arrowRight;
    this.arrowLeft;
    this.backButton;
};

Paloquiz.states.Highscores.prototype = {

    PAGE_SIZE: 5,
    HIGHSCORE_REGION: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    HIGHSCORE_IMAGE_SIZE: 0,

    init: function() {
        this.HIGHSCORE_REGION.x = this.game.width * .1;
        this.HIGHSCORE_REGION.y = this.game.height * .1;
        this.HIGHSCORE_REGION.width = this.game.width * .8;
        this.HIGHSCORE_REGION.height = this.game.height * .8;

        this.HIGHSCORE_IMAGE_SIZE = .8 * Math.min(
            this.HIGHSCORE_REGION.width * .25,
            this.HIGHSCORE_REGION.height / this.PAGE_SIZE);

        // Font styles
        this.nameTextStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'left',
            fill: 'white'
        }
        this.scoreTextStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'center',
            fill: 'white'
        }
        this.nameUserTextStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'left',
            fill: 'red'
        }
        this.scoreUserTextStyle = {
            font: 'Pixel Art',
            fontSize: '12px',
            align: 'center',
            fill: 'red'
        }
    },

    preload: function() {
        // Enable cross-origin image loading
        this.load.crossOrigin = 'anonymous';

        this.load.image('noface', 'assets/noface.png');
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('back', 'assets/back.png');
    },

    create: function() {
        // Set up background
        var background = this.add.image(this.game.world.centerX, this.game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
        background.width = this.game.width;
        background.height = this.game.height;

        // Create game objects
        this.createHighscoreEntries();
        this.createUI();

        // Handler for loaded profile pictures
        this.load.onLoadComplete.add(this.loadComplete, this);

        // Exit if not logged in
        if (!fbIsLoggedIn()) {
            this.state.start('Main');
            return;
        }
        fbGetFriendsScores(function(friendsScores, userPos) {
            this.friendsScores = friendsScores;
            this.userPos = userPos;
            this.maxPage = Math.floor(this.friendsScores.length / this.PAGE_SIZE);
            this.loadScoresPage();
        }, this);
    },

    shutdown: function() {
        // Remove handlers
        this.load.onLoadComplete.remove(this.loadComplete, this);
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
        // Hide all entries
        this.scores.forEach(function(s) {
            s.img.loadTexture('noface');
            s.img.visible = false;
            s.name.setStyle(this.nameTextStyle);
            s.name.visible = false;
            s.score.setStyle(this.scoreTextStyle);
            s.score.visible = false;
        }, this);

        // Make sure page is in range
        if (this.currentPage < 0) {
            this.currentPage = 0;
        }
        if (this.currentPage > this.maxPage) {
            this.currentPage = this.maxPage;
        }

        // Hide arrows as needed
        this.arrowRight.visible = this.currentPage < this.maxPage;
        this.arrowLeft.visible = this.currentPage > 0;

        // Count friends in page
        var iFriendStart = this.PAGE_SIZE * this.currentPage;
        var iFriendEnd = Math.min(
            this.PAGE_SIZE * (this.currentPage + 1),
            this.friendsScores.length);
        this.numFriendsInPage = iFriendEnd - iFriendStart;
        this.profileImagesData = new Array(this.numFriendsInPage);

        // Function that starts the loader after every friend information is read
        var readFriends = 0;
        var friendInformationRead = function() {
            readFriends++;
            if (readFriends >= this.numFriendsInPage) {
                this.profileImagesData.forEach(function(img, i) {
                    this.load.image(i, img.url);
                }, this);
                this.load.start();
            }
        }
        friendInformationRead = friendInformationRead.bind(this);

        // Iterate through friends
        for (var iFriend = iFriendStart, iScore = 0; iFriend < iFriendEnd; iFriend++, iScore++) {
            // Copy index to use in closure
            var iFriendCpy = iFriend;
            var iScoreCpy = iScore;
            fbGetProfileDetails(this.friendsScores[iFriend].user.id, function(friend) {
                this.scores[iScoreCpy].name.setText(friend.first_name || friend.name);
                this.scores[iScoreCpy].score.setText(this.friendsScores[iFriendCpy].score);
                // Use special style for the user
                if (iFriendCpy == this.userPos) {
                    this.scores[iScoreCpy].name.setStyle(this.nameUserTextStyle);
                    this.scores[iScoreCpy].score.setStyle(this.scoreUserTextStyle);
                }
                this.scores[iScoreCpy].name.visible = true;
                this.scores[iScoreCpy].score.visible = true;
                this.profileImagesData[iScoreCpy] = friend.image;
                friendInformationRead();
            }, this);
        }
    },

    createHighscoreEntries: function () {
        for (var i = 0; i < this.PAGE_SIZE; i++) {
            // Y baseline
            var y = this.game.world.centerY - (this.HIGHSCORE_REGION.height / 2) +
                (i + .5) * (this.HIGHSCORE_REGION.height / this.PAGE_SIZE);
            // Image occupies the first 25% in X dimension
            var img = this.add.image(
                this.HIGHSCORE_REGION.x + this.HIGHSCORE_REGION.width * .125, y,
                'noface');
            img.anchor.setTo(.5, .5);
            img.width = this.HIGHSCORE_IMAGE_SIZE;
            img.height = this.HIGHSCORE_IMAGE_SIZE;
            img.visible = false;
            // Name goes after image
            var name = this.add.text(
                this.HIGHSCORE_REGION.x - this.HIGHSCORE_REGION.width * .25, y,
                '', this.nameTextStyle);
            name.anchor.setTo(0, .5);
            name.visible = false;
            // Score goes at the end
            var score = this.add.text(
                this.HIGHSCORE_REGION.x + this.HIGHSCORE_REGION.width * .875, y,
                '', this.scoreTextStyle);
            score.anchor.setTo(.5, .5);
            score.visible = false;
            this.scores.push({
                img: img,
                name: name,
                score: score
            });
        }
    },

    createUI: function () {
        // Back button to go back to main state
        var backButton = this.add.button(
            this.game.width * .1, this.game.height * .1, 'back',
            function () {
                this.state.start('Main');
            }, this, 0, 0, 0);
        backButton.anchor.setTo(0, 0);

        // Arrows to navigate through pages
        this.arrowRight = this.add.button(
            this.game.width * .9, this.game.height * .9, 'arrow',
            function () {
                if (this.currentPage < this.maxPage) {
                    this.currentPage++;
                    this.loadScoresPage();
                }
            }, this, 0, 0, 0);
        this.arrowRight.anchor.setTo(1, 1);
        this.arrowLeft = this.add.button(
            this.game.width * .1, this.game.height * .9, 'arrow',
            function () {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.loadScoresPage();
                }
            }, this, 0, 0, 0);
        this.arrowLeft.scale.setTo(-1, 1);
        this.arrowLeft.anchor.setTo(0, 0);
    }

};
