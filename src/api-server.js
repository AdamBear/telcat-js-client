var express = require('express')
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var adminClient = require('./pomelo-admin').adminClient;

var config = {
    "host":"127.0.0.1",
    "port": 3005,
    "username": "monitor",
    "password": "monitor"
}


app.get('/index/', function (req, res) {
    res.send("haha!");
});

app.post('/index/', function (req, res) {
    res.set({'Content-Type': 'text/json', 'Encodeing': 'utf8'});

    try{
        var item = req.body.body;
        var target = req.body.target;

        if(!target){
            res.send({status: "error", msg:"请求参数错误, target是必要参数"});
            return;
        }
        var msg = JSON.parse(item);
    }catch(e){
        res.send({status: "error", msg:"请求参数错误", err: err});
        return;
    }
    msg.route = "onMessage";

    var id = 'pomelo_cli_' + Date.now();

    var client  = new adminClient({
        username: config.username,
        password: config.password,
        md5: false
    });

    try{
        client.connect(id, config.host, config.port, function(err) {
            if(err) {
                res.send({status: "server failed", message: err});
                return console.error('fail to connect: ' + err);
            }

            // pomeloAdmin客户端连接服务器
            client.request('channelMonitor', {type: "channelMonitor", method:'sendMessage', target:target, msg:msg}, function (err, msg) {
                if (err) {
                    res.send({status: "error", err: err});
                    return;
                }
                console.log("sendMessageSuccess:  " +
                    JSON.stringify(msg));
                res.send({status: "success", message: msg})
            });
            client.request('close',function (msg) {

            });
        });
    }catch(e){
        console.error(e);
        res.send({status: "server failed", message: e});
    }

});

var port = 7101;
app.listen(port);
console.log("api server started at:" + port);