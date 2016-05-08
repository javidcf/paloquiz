// Some functions to interact with Facebook

var FB_BASIC_PERMISSIONS = 'public_profile,user_friends';
var FB_PUBLISH_PERMISSIONS = 'publish_actions';
var FB_ALL_PERMISSIONS = FB_BASIC_PERMISSIONS + FB_PUBLISH_PERMISSIONS;

var FB_UID = undefined;
var FB_ACCESS_TOKEN = undefined;

var FB_CAN_PUBLISH = false;


function _fbSaveLogin(response) {
    FB_UID = response.authResponse.userID;
    FB_ACCESS_TOKEN = response.authResponse.accessToken;
}

function fbIsLoggedIn() {
    return Boolean(FB_UID && FB_ACCESS_TOKEN);
}

function fbCanPublish() {
    return fbIsLoggedIn() && (FB_CAN_PUBLISH === true);
}

function fbPublishScore(score, callback, errorCallback, thisArg) {
    if (arguments.length < 4 && !isFunction(errorCallback)) {
        thisArg = errorCallback;
        errorCallback = undefined;
    }
    if (callback) {
        callback = callback.bind(thisArg);
    }
    if (errorCallback) {
        errorCallback = errorCallback.bind(thisArg);
    }

    fbUseApi('/' + FB_UID + '/scores', 'post', {
            score: score
        },
        function(response) {
            if (response.success) {
                if (callback) {
                    callback(score);
                }
            } else {
                console.error('Could not publish score to Facebook');
                if (errorCallback) {
                    errorCallback(score);
                }
            }
        });
}

function fbGetUserScore(callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
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

function fbGetFriendsScores(callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
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

function fbGetProfileDetails(uid, callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
    fbUseApi('/' + uid + '/?fields=name,first_name', 'get', {},
        function(response1) {
            fbUseApi('/' + uid + '/picture', 'get', {},
                function(response2) {
                    if (callback) {
                        callback({
                            name: response1.name,
                            firstName: response1.first_name,
                            image: {
                                url: response2.data.url,
                                isSilhouette: response2.data.is_silhouette
                            }
                        });
                    }
                });
        });
}

function fbGetUserProfileDetails(callback, thisArg) {
    fbGetProfileDetails('me', callback, thisArg);
}

function fbUseApi(url, method, params, callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
    params = params || ({});
    if (fbIsLoggedIn()) {
        params.access_token = FB_ACCESS_TOKEN;
        FB.api(url, method, params, callback);
    }
}

function fbLogIn(callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
    if (fbIsLoggedIn()) {
        // Already logged in
        if (callback) {
            callback();
        }
    } else {
        FB.login(function(response) {
            if ((!response) || (!response.authResponse)) {
                return;
            }
            _fbSaveLogin(response);
            FB_CAN_PUBLISH = false;
            var granted = response.authResponse.grantedScopes.split(',');
            for (var i = 0; i < granted.length; i++) {
                if (granted[i] === FB_PUBLISH_PERMISSIONS) {
                    FB_CAN_PUBLISH = true;
                }
            }
            if (callback) {
                callback();
            }
        }, {
            scope: FB_BASIC_PERMISSIONS,
            return_scopes: true
        });
    }
}

function fbLogInPublish(callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
    if (fbCanPublish()) {
        // Already can publish
        if (callback) {
            callback();
        }
    } else {
        var loginParams;
        if (fbIsLoggedIn()) {
            loginParams = {
                scope: FB_PUBLISH_PERMISSIONS,
                return_scopes: true,
                auth_type: 'rerequest'
            };
        } else {
            loginParams = {
                scope: FB_ALL_PERMISSIONS,
                return_scopes: true
            };
        }
        FB.login(function(response) {
            if ((!response) || (!response.authResponse)) {
                return;
            }
            _fbSaveLogin(response);
            FB_CAN_PUBLISH = false;
            var granted = response.authResponse.grantedScopes.split(',');
            for (var i = 0; i < granted.length; i++) {
                if (granted[i] === FB_PUBLISH_PERMISSIONS) {
                    FB_CAN_PUBLISH = true;
                }
            }
            if (fbCanPublish() && callback) {
                callback();
            }
        }, loginParams);
    }
}

function fbInit(callbackLoggedIn, callbackNotLoggedIn, thisArg) {
    if (arguments.length < 3 && !isFunction(callbackNotLoggedIn)) {
        thisArg = callbackNotLoggedIn;
        callbackNotLoggedIn = undefined;
    }
    if (callbackLoggedIn) {
        callbackLoggedIn = callbackLoggedIn.bind(thisArg);
    }
    if (callbackNotLoggedIn) {
        callbackNotLoggedIn = callbackNotLoggedIn.bind(thisArg);
    }
    if (fbIsLoggedIn()) {
        // Already logged in
        if (callbackLoggedIn) {
            callbackLoggedIn();
        }
    } else {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                _fbSaveLogin(response);
                fbCheckPermissions(function (permissions) {
                    FB_CAN_PUBLISH = permissions[FB_PUBLISH_PERMISSIONS] === true;
                    if (callbackLoggedIn) {
                        callbackLoggedIn();
                    }
                });
            } else {
                if (callbackNotLoggedIn) {
                    callbackNotLoggedIn();
                }
            }
        }, true);
    }
}

function fbLogOut(callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
    if (fbIsLoggedIn()) {
        FB.logout(function() {
            FB_UID = undefined;
            FB_ACCESS_TOKEN = undefined;
            FB_CAN_PUBLISH = false;
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

function fbCheckPermissions(callback, thisArg) {
    if (callback) {
        callback = callback.bind(thisArg);
    }
    fbUseApi('/me/permissions', 'get', {},
        function(response) {
            var permissions = {};
            for (var i = 0; i < response.data.length; i++) {
                var granted = response.data[i].status === 'granted';
                permissions[response.data[i].permission] = granted;
            }

            if (callback) {
                callback(permissions);
            }
        });
}