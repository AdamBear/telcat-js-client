/**
 * Created by adam on 17-9-6.
 */
(function () {

    var pomeloClient = require('pomelo-jsclient-websocket');

    var DEFAULT_GATE_HOST = '127.0.0.1';
    var DEFAULT_GATE_PORT = 3014;
    var DEFAULT_USER_ID = 'test';

    var DEFAULT_ERROR_HANDLER = function (error) {
        console.error(error);
    }

    var DEFAULT_EVENT_HANDLER = function (data) {
        console.log(JSON.stringify(data));
        //alert(JSON.stringify(data));
    }

    var CONST = {
        CALL_STATE: {
            IDLE: 'IDLE',
            OFFHOOK: 'OFFHOOK',
            RING: 'RING'
        },
        CLIENT_TYPE: {
            BROWSER: 'browser',
            MOBILE: 'mobile',
            MONITOR: 'monitor'
        },
        SCOPE:{
            ALL: 'all',
            COMPANY: 'company',
            USER: 'user',
            CLIENT: 'client'
        }
    }

    var ERROR = {
        OK: 200,
        FAIL: 500,

        ENTRY: {
            CONNECT_CONNECTOR_SERVER_ERROR: 1000,
            ENTRY_FAIL: 1001,
            USER_NOT_EXIST_OR_WRONG_PASSWORD: 1003
        },

        GATE: {
            CONNECT_GATE_SERVER_ERROR: 2000,
            NO_SERVER_AVAILABLE: 2001
        },

        CHAT: {
            REQUEST_ERROR: 3000,
            CHANNEL_CREATE: 3001,
            CHANNEL_NOT_EXIST: 3002,
            UNKNOWN_CONNECTOR: 3003,
            NOT_ONLINE: 3004
        }
    }

    var CallClient = function (opt) {
        opt = opt || {};
        this.host = opt.host || DEFAULT_GATE_HOST;
        this.port = opt.port || DEFAULT_GATE_PORT;
        this.username = opt.username || DEFAULT_USER_ID;
        this.password = opt.password || '';
        this.type = opt.type || 'browser';
        this.number = opt.number || Date.now();

        this.uid = this.username + "<-->" + this.type + "<-->" + this.number;

        this.onError = opt.onError || DEFAULT_ERROR_HANDLER;
        this.onEnter = opt.onEnter || DEFAULT_EVENT_HANDLER;
        this.onAdd = opt.onAdd || DEFAULT_EVENT_HANDLER;
        this.onLeave = opt.onLeave || DEFAULT_EVENT_HANDLER;
        this.onCompanyAdd = opt.onCompanyAdd || DEFAULT_EVENT_HANDLER;
        this.onCompanyLeave = opt.onCompanyLeave || DEFAULT_EVENT_HANDLER;

        this.onCall = opt.onCall || DEFAULT_EVENT_HANDLER;
        this.onHangUp = opt.onHangUp || DEFAULT_EVENT_HANDLER;

        this.onCallStateChange = opt.onCallStateChange || DEFAULT_EVENT_HANDLER;
        this.onRecorded = opt.onRecorded || DEFAULT_EVENT_HANDLER;

        this.onReconnect = opt.onReconnect || DEFAULT_EVENT_HANDLER;
        this.onMessage = opt.onMessage || DEFAULT_EVENT_HANDLER;

        this.onKick = opt.onKick || DEFAULT_EVENT_HANDLER;
        this.pomelo = new pomeloClient();

        var self = this;
        this.pomelo.on("onLeave", function (user) {
            self.onLeave(user);
        });

        this.pomelo.on("onAdd", function (user) {
            self.onAdd(user);
        });

        this.pomelo.on("onCompanyLeave", function (user) {
            self.onCompanyLeave(user);
        });

        this.pomelo.on("onCompanyAdd", function (user) {
            self.onCompanyAdd(user);
        });

        this.pomelo.on("onCall", function (msg) {
            self.onCall(msg);
        });

        this.pomelo.on("onHangUp", function (msg) {
            self.onHangUp(msg);
        });

        this.pomelo.on("onCallStateChange", function (msg) {
            self.onCallStateChange(msg);
        });

        this.pomelo.on("onRecorded", function (msg) {
            self.onRecorded(msg);
        });

        this.pomelo.on("onKick", function (msg) {
            self.onKick(msg);
        });

        this.pomelo.on("onMessage", function (msg) {
            self.onMessage(msg);
        });

        this.pomelo.on("reconnect", function () {
            self.onReconnect();
        });

        this.pomelo.on('close', function () {
            console.log("connection is closed");
        })

        //this.init();
    };

    CallClient.prototype.log = function (msg) {
        console.log(msg);
    };

    CallClient.prototype.disconnect = function () {
        this.pomelo.disconnect();
    }

    CallClient.prototype.init = function (noNeedEnter, cb) {
        this.log("start connect gate server at " + this.host + ":" + this.port);
        var client = this;

        client.pomelo.init({
            host: client.host,
            port: client.port,
            log: true
        }).then(function () {
            client.queryEntry(client.uid, function (host, port) {
                if (host) {
                    client.connHost = host;
                    client.connPort = port;
                    client.reconnect(noNeedEnter, cb);
                }
            })
        }).catch(function (err) {
            client.onError({
                msg: "connect the gate sever error at " + client.host + ":" + client.port,
                code: ERROR.GATE.CONNECT_GATE_SERVER_ERROR,
                err: err
            });
        })
    }

    CallClient.prototype.reconnect = function (noNeedEnter,cb) {
        var client = this;

        client.log("start connect connector server at " + client.connHost + ":" + client.connPort);

        client.pomelo.init({
            host: client.connHost,
            port: client.connPort,
            reconnect: true
        }).then(function () {
            if(!noNeedEnter){
                client.enter();
            }else{
                cb(null);
            }
        }).catch(function (err) {
            client.onError({
                msg: "connect the connector sever error at " + client.connHost + ":" + client.connHost,
                code: ERROR.ENTRY.CONNECT_CONNECTOR_SERVER_ERROR,
                err: err
            });
        });
    }

    CallClient.prototype.sendMessageAll = function () {
        var client = this;

        client.log("start sendMessage from connector server");

        client.pomelo.request("connector.entryHandler.sendMessage",
            {
                uid: 'system' + Date.now()
            }
        ).then(function (data) {
            if (data) {
               console.log("sendMessage return data" + JSON.stringify(data));
            }
        }).catch(function (err) {
            client.onError({
                msg: "enter the connector server error with uid:" + client.uid,
                code: ERROR.ENTRY.ENTRY_FAIL,
                err: err
            });
        });
    };

    CallClient.prototype.enter = function () {
        var client = this;

        client.log("start enter the connector server");

        client.pomelo.request("connector.entryHandler.enter",
            {
                uid: client.uid,
                password: client.password
            }
        ).then(function (data) {
            if (data) {
                if(data.code === 200){
                    return client.onEnter(data)
                }
                if(data.code === 500){
                    client.onError({
                        msg: "enter the connector server error with uid:" + client.uid,
                        code: ERROR.ENTRY.USER_NOT_EXIST_OR_WRONG_PASSWORD
                    })
                }else{
                    client.onError({
                        msg: "enter the connector server error with uid:" + client.uid,
                        code: ERROR.ENTRY.ENTRY_FAIL,
                        err: data.error
                    })
                };
            }
        }).catch(function (err) {
            client.onError({
                msg: "enter the connector server error with uid:" + client.uid,
                code: ERROR.ENTRY.ENTRY_FAIL,
                err: err
            });
        });
    }


// query connector
    CallClient.prototype.queryEntry = function (uid, callback) {
        var client = this;

        client.log("start query gate server at " + this.host + ":" + this.port);

        var route = 'gate.gateHandler.queryEntry';
        client.pomelo.request(route, {
            uid: uid
        }).then(function (data) {
            client.pomelo.disconnect();
            if (data.code === 500) {
                return callback(null);
            }
            callback(data.host, data.port);
        }).catch(function (err) {
            client.onError({
                msg: "query the gate sever onError with uid:" + uid,
                code: ERROR.GATE.NO_SERVER_AVAILABLE,
                err: err
            });
        });
    };

    CallClient.prototype.getCompanyClients = function (cb) {
        var client = this;

        client.log("start request getCompanyUsers");

        client.pomelo.request("chat.chatHandler.getCompanyUserInfos",
            {
                uid: client.uid
            }
        ).then(function (data) {
            return cb && cb(data.users);
        }).catch(function (err) {
            client.onError({
                msg: "request getCompanyUserinfos error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    CallClient.prototype.getClients = function (cb) {
        var client = this;

        client.log("start request getClients");

        client.pomelo.request("chat.chatHandler.getUsers",
            {
                uid: client.uid
            }
        ).then(function (data) {
            return cb && cb(data.users);
        }).catch(function (err) {
            client.onError({
                msg: "request getUsers error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    CallClient.prototype.makeCall = function (from, to, cb) {
        var client = this;

        client.log("start request makeCall from:" + from + " to:" + to);

        client.pomelo.request("chat.chatHandler.makeCall",
            {
                uid: client.uid,
                from: from,
                to: to
            }
        ).then(function () {
            return cb && cb('ok');
        }).catch(function (err) {
            client.onError({
                msg: "request makeCall error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    CallClient.prototype.hangUp = function (from, to, cb) {
        var client = this;

        client.log("start request hangUp from:" + from + " to:" + to);

        client.pomelo.request("chat.chatHandler.hangUp",
            {
                uid: client.uid,
                from: from,
                to: to
            }
        ).then(function () {
            return cb && cb('ok');
        }).catch(function (err) {
            client.onError({
                msg: "request makeCall error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    CallClient.prototype.sendMessage = function (msg, target, scope, type, cb) {
        var client = this;

        client.log("start sendMessage to target:" + target + " scope:" + scope + " type:" + type);

        client.pomelo.request("chat.chatHandler.sendMessage",
            {
                msg: msg,
                target: target,
                scope: scope,
                type: type
            }
        ).then(function () {
            return cb && cb('ok');
        }).catch(function (err) {
            client.onError({
                msg: "sendMessage error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    //移动端使用接口，此处仅用于测试
    CallClient.prototype.changeCallState = function (from, state, number, cb) {
        var client = this;

        client.log("start request changeCallState state:" + state + " number:" + number);

        client.pomelo.request("chat.chatHandler.changeCallState",
            {
                from: from,
                state: state,
                number: number
            }
        ).then(function () {
            return cb && cb('ok');
        }).catch(function (err) {
            client.onError({
                msg: "request changeCallState error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    //移动端使用接口，此处仅用于测试
    CallClient.prototype.sendRecordUrl = function (from, to, url, cb) {
        var client = this;

        client.log("start request sendRecordUrl from:" + from + " to:" + to + " url:" + url);

        client.pomelo.request("chat.chatHandler.sendRecordUrl",
            {
                from: from,
                to: to,
                url: url
            }
        ).then(function () {
            return cb && cb('ok');
        }).catch(function (err) {
            client.onError({
                msg: "request sendRecordUrl error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb && cb(null);
        });
    }

    CallClient.prototype.kick = function (uid, cb) {
        var client = this;

        client.log("start request kick id:" + uid);

        client.pomelo.request("chat.chatHandler.kick",
            {
                uid: uid
            }
        ).then(function () {
            return cb('OK')
        }).catch(function (err) {
            client.onError({
                msg: "request kick error with uid:" + client.uid,
                code: ERROR.CHAT.REQUEST_ERROR,
                err: err
            });
            return cb(null);
        });
    };

    CallClient.ERROR = ERROR;
    CallClient.CONST = CONST;

    module.exports = CallClient;
})();