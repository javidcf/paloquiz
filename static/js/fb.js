// Some functions to interact with Facebook

var FB_UID = undefined;
var FB_ACCESS_TOKEN = undefined;

var _MAX_HIGH_SCORES = 200;


function fbIsLoggedIn() {
    return Boolean(FB_UID && FB_ACCESS_TOKEN);
}

function fbPublishScore(score, callback, errorCallback) {
    fbUseApi(function () {
        FB.api('/' + FB_UID + '/scores', 'post',
            {access_token: accessToken, score: score},
            function (response) {
                if (response.success) {
                    if (callback) {
                        callback(score);
                    }
                } else {
                    console.error('Could not publish score to Facebook');
                    if (errorCallback) {
                        errorCallback();
                    }
                }
            });
    });
}

function fbGetUserScore(callback) {
    fbUseApi(function () {
        FB.api('/' + FB_UID + '/scores', 'post', {access_token: accessToken},
            function (response) {
                data = response.data;
                if (data.length < 1) {
                    console.error('Could not retrieve the user score');
                    return;
                }
                // Check if there are several scores in the response
                var iScore = 0;
                if (data.length > 1) {
                    // Find the app score
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].application.id == FB_APP_ID) {
                            iScore = i;
                            break;
                        }
                    }
                }
                // Get the score
                var score = data[iScore].score;
                if (callback) {
                    callback(score);
                }
            });
    });
}

function fbGetFriendsScores(callback) {
    fbUseApi(function () {
        FB.api('/' + FB_APP_ID + '/scores', 'post', {access_token: accessToken},
            function (response) {
                data = response.data;
                // Find user position
                var userIdx = undefined;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].user.id == FB_UID) {
                        userIdx = i;
                        break;
                    }
                }

                if (callback) {
                    callback(data, userIdx);
                }
            });
    });
}

function fbGetProfilePicture(uid, callback) {
    fbUseApi(function () {
        FB.api('/' + uid + '/picture', 'post', {access_token: accessToken},
            function (response) {
                if (callback) {
                    callback(response.data.url, response.data.url.is_silhouette);
                }
            });
    });
}

function fbGetUserProfilePicture(callback) {
    fbUseApi(function () {
        FB.api('/me/picture', 'post', {access_token: accessToken},
            function (response) {
                if (callback) {
                    callback(response.data.url, response.data.url.is_silhouette);
                }
            });
    });
}

function fbUseApi(callback) {
    if (fbIsLoggedIn()) {
        // Already logged in
        callback();
    } else {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                // Already granted permissions
                _fbSaveLogin(response);
                callback();
            } else {
                // Show login dialog first
                FB.login(function (response) {
                    _fbSaveLogin(response);
                    if (callback) {
                        callback();
                    }
                }, {scope: 'public_profile, user_friends, publish_actions'});
            }
        });
    }
}


function _fbSaveLogin()
{
    FB_UID = response.authResponse.userID;
    FB_ACCESS_TOKEN = response.authResponse.accessToken;
}