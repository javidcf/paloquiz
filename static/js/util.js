
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function getJSON(url, callback, callbackError, thisArg)
{
    if (arguments.length < 4 && isFunction(callbackError)) {
        thisArg = callbackError;
        callbackError = undefined;
    }
    if (callback) {
        callback = callback.bind(thisArg);
    }
    if (callbackError) {
        callbackError = callbackError.bind(thisArg);
    }

    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();

    xmlHttp.open('GET', url, true);
    xmlHttp.send( null );

    var response = xmlHttp.responseText;

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4){
            if(xmlHttp.status == 200) {
                var jsonResponse = JSON.parse(xmlHttp.responseText);
                if (callback) {
                    callback(jsonResponse, xmlHttp.status);
                }
            }else{
                try{
                    errResponse = JSON.parse(response);
                    console.error(errResponse['message']);
                    if (callbackError){
                        callbackError(errResponse['message'], xmlHttp.status);
                    }
                }catch(e){
                    var errMsg = 'Unexpected error ('+ xmlHttp.status +')';
                    console.error(errMsg);
                    if (callbackError){
                        callbackError(errMsg, xmlHttp.status);
                    }
                }
            }
        }
    };
}
