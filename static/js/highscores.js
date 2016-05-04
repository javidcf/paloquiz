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
    this.positionTextStyle;
    this.nameUserTextStyle;
    this.scoreUserTextStyle;
    this.positionUserTextStyle;
    this.arrowRight;
    this.arrowLeft;
    this.backButton;
};

Paloquiz.states.Highscores.prototype = {

    PAGE_SIZE: 6,

    init: function() {
        this.createLayoutBoxes();

        // Font styles
        this.createFontStyles();
    },

    preload: function() {
        // Enable cross-origin image loading
        this.load.crossOrigin = 'anonymous';
    },

    create: function() {

        // Create game objects
        this.createHighscoreEntries();
        this.createUI();

        // Handler for loaded profile pictures
        this.load.onLoadComplete.add(this.loadComplete, this);

        // Go on only if logged in
        fbInit(function() {
                fbGetFriendsScores(function(friendsScores, userPos) {
                    this.friendsScores = friendsScores;
                    this.userPos = userPos;
                    this.maxPage = Math.floor(this.friendsScores.length / this.PAGE_SIZE);
                    this.loadScoresPage();
                }, this);
            },
            function() {
                // Exit if not logged in
                this.state.start('Router');
            },
            this);
    },

    shutdown: function() {
        // Remove handlers
        this.load.onLoadComplete.remove(this.loadComplete, this);

        this.destroyUI();
        this.destroyHighscoreEntries();
    },

    loadComplete: function() {
        for (var i = 0; i < this.numFriendsInPage; i++) {
            if (!this.profileImagesData[i].isSilhouette) {
                this.scores[i].img.loadTexture(i);
            } else {
                this.scores[i].img.loadTexture('noface');
            }
            this.scores[i].img.width = this.IMAGE_SIZE;
            this.scores[i].img.height = this.IMAGE_SIZE;
            this.scores[i].img.anchor.setTo(.5, .5);
            this.scores[i].img.visible = true;
        }
    },

    loadScoresPage: function() {
        // Hide all entries
        this.scores.forEach(function(s) {
            s.img.visible = false;
            s.pos.setStyle(this.positionTextStyle);
            s.pos.visible = false;
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
            (function(iScore, iFriend) {
                fbGetProfileDetails(this.friendsScores[iFriend].user.id, function(friend) {
                    this.scores[iScore].pos.setText((iFriend + 1) + '.');
                    this.scores[iScore].name.setText(friend.firstName || friend.name);
                    this.scores[iScore].score.setText(this.friendsScores[iFriend].score);
                    // Use special style for the user
                    if (iFriend == this.userPos) {
                        this.scores[iScore].pos.setStyle(this.positionUserTextStyle);
                        this.scores[iScore].name.setStyle(this.nameUserTextStyle);
                        this.scores[iScore].score.setStyle(this.scoreUserTextStyle);
                    }
                    this.scores[iScore].pos.visible = true;
                    this.scores[iScore].name.visible = true;
                    this.scores[iScore].score.visible = true;
                    this.profileImagesData[iScore] = friend.image;
                    friendInformationRead();
                }, this);
            }).bind(this)(iScore, iFriend);
        }
    },

    createFontStyles: function() {
        var textSize = Math.floor(this.NAME_BOX.width / 6.0) + 'px';

        var fontFace = 'Pixel Art';
        var positionTextSize = textSize;
        var nameTextSize = textSize;
        var scoreTextSize = textSize;
        var normalColor = 'white';
        var userColor = 'red';

        // Normal
        this.positionTextStyle = {
            font: fontFace,
            fontSize: positionTextSize,
            fill: normalColor,
            align: 'right',
            boundsAlignH: 'right',
            boundsAlignV: 'middle'
        };
        this.nameTextStyle = {
            font: fontFace,
            fontSize: positionTextSize,
            fill: normalColor,
            align: 'left',
            boundsAlignH: 'left',
            boundsAlignV: 'middle',
            wordWrap: true,
            wordWrapWidth: this.NAME_BOX.width
        };
        this.scoreTextStyle = {
            font: fontFace,
            fontSize: scoreTextSize,
            fill: 'white',
            align: 'right',
            boundsAlignH: 'right',
            boundsAlignV: 'middle'
        };
        // User
        this.positionUserTextStyle = {
            font: fontFace,
            fontSize: positionTextSize,
            fill: userColor,
            align: 'right',
            boundsAlignH: 'right',
            boundsAlignV: 'middle'
        };
        this.nameUserTextStyle = {
            font: fontFace,
            fontSize: nameTextSize,
            fill: userColor,
            align: 'left',
            boundsAlignH: 'left',
            boundsAlignV: 'middle',
            wordWrap: true,
            wordWrapWidth: this.NAME_BOX.width
        };
        this.scoreUserTextStyle = {
            font: fontFace,
            fontSize: scoreTextSize,
            fill: userColor,
            align: 'right',
            boundsAlignH: 'right',
            boundsAlignV: 'middle'
        };
    },

    createHighscoreEntries: function() {
        for (var i = 0; i < this.PAGE_SIZE; i++) {
            var xOffset = 0;
            var yOffset = i * this.ENTRY_BOX.height;

            // Position
            var pos = this.add.text(0, 0, '', this.positionTextStyle);
            pos.setTextBounds(
                this.POSITION_BOX.x + xOffset,
                this.POSITION_BOX.y + yOffset,
                this.POSITION_BOX.width,
                this.POSITION_BOX.height);
            pos.visible = false;

            // Image
            var img = this.add.image(
                this.IMAGE_BOX.x + this.IMAGE_BOX.width / 2 + xOffset,
                this.IMAGE_BOX.y + this.IMAGE_BOX.height / 2 + yOffset,
                'noface');
            img.visible = false;

            // Name
            var name = this.add.text(0, 0, '', this.nameTextStyle);
            name.setTextBounds(
                this.NAME_BOX.x + xOffset,
                this.NAME_BOX.y + yOffset,
                this.NAME_BOX.width,
                this.NAME_BOX.height);
            name.visible = false;

            // Score
            var score = this.add.text(0, 0, '', this.scoreTextStyle);
            score.setTextBounds(
                this.SCORE_BOX.x + xOffset,
                this.SCORE_BOX.y + yOffset,
                this.SCORE_BOX.width,
                this.SCORE_BOX.height);
            score.visible = false;

            this.scores.push({
                pos: pos,
                img: img,
                name: name,
                score: score
            });
        }
    },

    destroyHighscoreEntries: function() {
        for (var i = 0; i < this.scores.length; i++) {
            if (this.scores[i]) {
                if (this.scores[i].img) {
                    this.scores[i].img.loadTexture('noface');
                    this.scores[i].img.destroy();
                }
                if (this.scores[i].name) {
                    this.scores[i].name.destroy();
                }
                if (this.scores[i].pos) {
                    this.scores[i].pos.destroy();
                }
                if (this.scores[i].score) {
                    this.scores[i].score.destroy();
                }
            }
        }
        this.scores = [];
    },

    createUI: function() {
        // Back button to go back to main state
        this.backButton = this.add.button(0, 0, 'back',
            function() {
                this.state.start('Router');
            }, this, 0, 0, 0);
        this.backButton.smoothed = false;
        var backButtonSize = .1 * Math.min(this.world.width, this.world.height);
        this.backButton.width = backButtonSize;
        this.backButton.height = backButtonSize;
        this.backButton.anchor.setTo(0, 0);
        this.backButton.x = this.backButton.width * .2;
        this.backButton.y = this.backButton.height * .2;

        // Arrows to navigate through pages
        var arrowSize = .1 * Math.min(this.world.width, this.world.height);
        this.arrowRight = this.add.button(0, 0, 'arrow',
            function() {
                if (this.currentPage < this.maxPage) {
                    this.currentPage++;
                    this.loadScoresPage();
                }
            }, this, 0, 0, 0);
        this.arrowRight.smoothed = false;
        this.arrowRight.width = arrowSize;
        this.arrowRight.height = arrowSize;
        this.arrowRight.anchor.setTo(1, 1);
        this.arrowRight.x = this.world.width - this.arrowRight.width * .2;
        this.arrowRight.y = this.world.height - this.arrowRight.height * .2;
        this.arrowRight.visible = false;

        this.arrowLeft = this.add.button(0, 0, 'arrow',
            function() {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.loadScoresPage();
                }
            }, this, 0, 0, 0);
        this.arrowLeft.width = -arrowSize;
        this.arrowLeft.height = arrowSize;
        this.arrowLeft.smoothed = false;
        this.arrowLeft.anchor.setTo(1, 1);
        this.arrowLeft.x = -this.arrowLeft.width * .2;
        this.arrowLeft.y = this.world.height - this.arrowLeft.height * .2;
        this.arrowLeft.visible = false;
    },

    destroyUI: function() {
        this.backButton.destroy();
        this.arrowRight.destroy();
        this.arrowLeft.destroy();
    },

    // Boxes

    ENTRIES_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    ENTRY_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    POSITION_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    IMAGE_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    NAME_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    SCORE_BOX: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    IMAGE_SIZE: 0,

    createLayoutBoxes: function() {
        var margin = .15 * Math.min(this.world.width, this.world.height);
        this.ENTRIES_BOX.x = margin;
        this.ENTRIES_BOX.y = margin;
        this.ENTRIES_BOX.width = this.world.width - 2 * margin;
        this.ENTRIES_BOX.height = this.world.height - 2 * margin;

        this.ENTRY_BOX.x = this.ENTRIES_BOX.x;
        this.ENTRY_BOX.y = this.ENTRIES_BOX.y;
        this.ENTRY_BOX.width = this.ENTRIES_BOX.width;
        this.ENTRY_BOX.height = this.ENTRIES_BOX.height / this.PAGE_SIZE;

        this.POSITION_BOX.x = this.ENTRY_BOX.x + this.ENTRY_BOX.width * .0;
        this.POSITION_BOX.y = this.ENTRY_BOX.y;
        this.POSITION_BOX.width = this.ENTRIES_BOX.width * .05;
        this.POSITION_BOX.height = this.ENTRY_BOX.height;

        this.IMAGE_BOX.x = this.ENTRY_BOX.x + this.ENTRY_BOX.width * .05;
        this.IMAGE_BOX.y = this.ENTRY_BOX.y;
        this.IMAGE_BOX.width = this.ENTRIES_BOX.width * .25;
        this.IMAGE_BOX.height = this.ENTRY_BOX.height;

        this.NAME_BOX.x = this.ENTRY_BOX.x + this.ENTRY_BOX.width * .30;
        this.NAME_BOX.y = this.ENTRY_BOX.y;
        this.NAME_BOX.width = this.ENTRIES_BOX.width * .45;
        this.NAME_BOX.height = this.ENTRY_BOX.height;

        this.SCORE_BOX.x = this.ENTRY_BOX.x + this.ENTRY_BOX.width * .78;
        this.SCORE_BOX.y = this.ENTRY_BOX.y;
        this.SCORE_BOX.width = this.ENTRIES_BOX.width * .22;
        this.SCORE_BOX.height = this.ENTRY_BOX.height;

        this.IMAGE_SIZE = .6 * Math.min(
            this.ENTRY_BOX.width * .25,
            this.ENTRY_BOX.height);
    }

};