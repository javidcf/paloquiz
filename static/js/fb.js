// Some functions to interact with Facebook

var FB_PERMISSIONS = 'public_profile, user_friends, publish_actions';

var FB_UID = undefined;
var FB_ACCESS_TOKEN = undefined;


function _fbSaveLogin(response) {
    FB_UID = response.authResponse.userID;
    FB_ACCESS_TOKEN = response.authResponse.accessToken;
}

function fbIsLoggedIn() {
    return Boolean(FB_UID && FB_ACCESS_TOKEN);
}

function fbPublishScore(score, callback, errorCallback) {
    fbUseApi('/' + FB_UID + '/scores', 'post', {},
        function(response) {
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
}

function fbGetUserScore(callback) {
    fbUseApi('/' + FB_UID + '/scores', 'get', {},
        function(response) {
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
}

function fbGetFriendsScores(callback) {
    fbUseApi('/' + FB_APP_ID + '/scores', 'get', {},
        function(response) {
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
}

function fbGetProfilePicture(uid, callback) {
    fbUseApi('/' + uid + '/picture', 'get', {},
        function(response) {
            if (callback) {
                callback(response.data.url, response.data.is_silhouette);
            }
        });
}

function fbGetUserProfilePicture(callback) {
    fbUseApi('/me/picture', 'get', {},
        function(response) {
            if (callback) {
                callback(response.data.url, response.data.is_silhouette);
            }
        });
}

function fbUseApi(url, method, params, callback) {
    params = params || ({});
    fbLogin(function() {
        params.access_token = FB_ACCESS_TOKEN;
        FB.api(url, method, params, callback);
    });
}

function fbLogIn(callback) {
    if (fbIsLoggedIn()) {
        // Already logged in
        if (callback) {
            callback();
        }
    } else {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                _fbSaveLogin(response);
                if (callback) {
                    callback();
                }
            } else {
                // Show login dialog first
                FB.login(function(response) {
                    _fbSaveLogin(response);
                    if (callback) {
                        callback();
                    }
                }, {
                    scope: FB_PERMISSIONS
                });
            }
        });
    }
}

function fbInit(callbackLoggedIn, callbackNotLoggedIn) {
    if (fbIsLoggedIn()) {
        // Already logged in
        if (callbackLoggedIn) {
            callbackLoggedIn();
        }
    } else {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                _fbSaveLogin(response);
                if (callbackLoggedIn) {
                    callbackLoggedIn();
                }
            } else {
                if (callbackNotLoggedIn) {
                    callbackNotLoggedIn();
                }
            }
        });
    }
}

function fbLogOut(callback) {
    if (fbIsLoggedIn()) {
        FB.logout(function() {
            FB_UID = undefined;
            FB_ACCESS_TOKEN = undefined;
            if (callback) {
                callback();
            }
        });
    } else {
        if (callback) {
            callback();
        }
    }
}