/**
 * Created by adam on 17-9-13.
 */

if (typeof(window) === 'undefined') {
    global.WebSocket = require('ws');
    function alert(msg) {
        console.log("alerted:" + msg);
    }
    var CallClient = require('./telcat-js-client');
}

var callClient = new CallClient(
    {
        'host':'117.25.156.237',
        '--host':'127.0.0.1',
        port:3014,
        username: 'test1',
        password: 'testp',
        type: CallClient.CONST.CLIENT_TYPE.BROWSER,
        number: Date.now()
    }
);

callClient.onError = function (error) {
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


callClient.onCall = function (from, to) {
    console.log("a call is made from:" + from + " to:" + to);
}

callClient.onCallStateChange = function (state, number) {
    console.log("call stat changed to:" + state + ", number:" + number);
}

callClient.init();

