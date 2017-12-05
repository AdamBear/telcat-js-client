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

var gateHost = '127.0.0.1';
//var gateHost = '117.25.156.237';

var clientType = CallClient.CONST.CLIENT_TYPE.BROWSER;
//var clientType = CallClient.CONST.CLIENT_TYPE.MOBILE;


//monitorClient.init();

var callClient = new CallClient(
    {
        host: gateHost,
        port:3014,
        username: '18150155258',
        password: '111111',
        type: clientType,
        modal: 'Vivo X11',
        '--number': '11111111',
        'number': Date.now()
    }
);


callClient.onError = function (error) {
    if(error.code === CallClient.ERROR.ENTRY.USER_NOT_EXIST_OR_WRONG_PASSWORD){
        alert("login failed!");
    }
    console.error(error);
};

callClient.onEnter = function (data) {
    //alert(JSON.stringify(data));
    //callClient.makeCall('18150155258', '10001');

    // callClient.getClients(function (clients) {
    //     console.log("clients:" + JSON.stringify(clients));
    // })
    //callClient.changeCallState(CallClient.CONST.CALL_STATE.IDLE, null);
    //callClient.sendRecordUrl('18150155258', '12127', 'http://test.com/test.mp3');
};

callClient.onMessage = function (msg) {
    console.log("received a msg:" + JSON.stringify(msg))
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

callClient.onHangUp = function (msg) {
    console.log("a HandUp is requested to call from:" + msg.from + " to:" + msg.to);
}

callClient.onCallStateChange = function (msg) {
    console.log("call stat of " + msg.from + " changed to:" + msg.state + ", incomingNumber:" + msg.number);
}

callClient.onRecorded = function (msg) {
    console.log("recorded the call from " + msg.from + " to:" + msg.to + ", url:" + msg.url);
}

callClient.onReconnect = function () {
    console.log("reconnecting...");
    var self = this;
    setTimeout(function () {
        //self.enter();
    }, 500)
}


callClient.init(true, function () {
    callClient.sendMessageAll();
});



// setTimeout(function () {
//     //callClient.enter();
//     setTimeout(function () {
//         //callClient.sendMessage({data:"test"}, null, CallClient.CONST.SCOPE.COMPANY, CallClient.CONST.CLIENT_TYPE.BROWSER)
//         // callClient.hangUp('18150155258', '12127', function (msg) {
//         //     console.log("hangup OK!")
//         // });
//     }, 5000)
// }, 500)