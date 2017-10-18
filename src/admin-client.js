/**
 *  Created by JianBao on 2015/11/23.
 *  通过pomeloAdmin，模拟客户端向服务器发起请求，通过pomeloAdmin跳转到相应的handler处理，验证服务器端函数的有效性
 */
// 引用pomelo-admin模块
var adminClient = require('pomelo-admin').adminClient;

// 具体的pomelo服务器host、port配置
var config = {
    "host":"127.0.0.1",
    "port": 3005,
    "username": "monitor",
    "password": "monitor"
}

// 实例化
var client  = new adminClient({
    username: config.username,
    password: config.password,
    md5: false
});

var id = 'pomelo_cli_' + Date.now();

// pomeloAdmin客户端连接服务器
client.connect(id, config.host, config.port, function(err) {
    if(err) { return console.error('fail to connect: ' + err);}

    // 发送给pomelo服务器的具体数据
    var msg = {
        str: "Hello World"
    };

    // 在线人数请求
    // 'onlineUser'是pomelo服务器端处理在线人数的监控模块
    client.request('onlineUser', {type: "onlineUser"}, function (err, msg) {
        if (err) {return console.error('fail to request online user:' + err);}
        console.log("current total onlineUser:  " +
            JSON.stringify(msg));
    });

    client.request('channelMonitor', {type: "channelMonitor", method:'sendMessage', msg:{route:"onMessage", data:"test"}}, function (err, msg) {
        if (err) {return console.error('fail to request channelMonitor:' + err);}
        console.log("sendMessageSuccess:  " +
            JSON.stringify(msg));
    });

    // 踢掉在线玩家
    // 'kickOutUser'是pomelo服务端踢出在线玩家的监控模块
    // client.request('kickOutUser', {uid: 1}, function(err, msg) {
    //     if(err) { return console.error('fail to request kickOutUser: ' + err);}
    //
    //     console.log(msg);
    // });
});