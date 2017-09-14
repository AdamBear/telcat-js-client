/**
 * Created by adam on 17-9-13.
 */

if (typeof(window) === 'undefined') {
    global.WebSocket = require('ws');
    function alert(msg) {
        console.log("alerted:" + msg);
    }
    var CallClient = require('./telcat-js-client.js');
}

var callClient = new CallClient(
    {
        '--host':'117.25.156.237',
        'host':'127.0.0.1',
        port:3014,
        username: '18059240065',
        password: '123456',
        type: CallClient.CONST.CLIENT_TYPE.BROWSER,
        number: Date.now()
    }
);

callClient.onError = function (error) {
    if(error.code === CallClient.ERROR.ENTRY.USER_NOT_EXIST_OR_WRONG_PASSWORD){
        alert("login failed!");
    }
    console.error(error);
};

callClient.onEnter = function (data) {
    alert(JSON.stringify(data));
    callClient.makeCall('11111111', '22222222');
    callClient.changeCallState(CallClient.CONST.CALL_STATE.IDLE, null);

    callClient.getClients(function (clients) {
        console.log("clients:" + JSON.stringify(clients));
    })
};


callClient.onAdd = function (user) {
    console.log("a user is joined:" + JSON.stringify(user))
};

callClient.onLeave = function (user) {
    console.log("a user is left:" + JSON.stringify(user))
};

callClient.onCall = function (msg) {
    console.log("a call is made from:" + msg.from + " to:" + msg.to);
}

callClient.onCallStateChange = function (msg) {
    console.log("call stat of " + msg.from + " changed to:" + msg.state + ", incomingNumber:" + msg.number);
}

callClient.init();