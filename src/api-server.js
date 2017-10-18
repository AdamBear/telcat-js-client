var express = require('express')
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var adminClient = require('pomelo-admin').adminClient;

var config = {
    "host":"127.0.0.1",
    "port": 3005,
    "username": "monitor",
    "password": "monitor"
}

var client  = new adminClient({
    username: config.username,
    password: config.password,
    md5: false
});

var id = 'pomelo_cli_' + Date.now();

client.connect(id, config.host, config.port, function(err) {
    if(err) { return console.error('fail to connect: ' + err);}
});

app.get('/index/', function (req, res) {
    res.send("haha!");
});

app.post('/index/', function (req, res) {
    res.set({'Content-Type': 'text/json', 'Encodeing': 'utf8'});

    var item = req.body.body;
    // console.log(item);
    var msg = JSON.parse(item);
    msg.route = "onMessage";

    // pomeloAdmin客户端连接服务器
    client.request('channelMonitor', {type: "channelMonitor", method:'sendMessage', msg:msg}, function (err, msg) {
        if (err) {
            res.send({status: "error", err: err});
            return;
        }
        console.log("sendMessageSuccess:  " +
            JSON.stringify(msg));
        res.send({status: "success", message: msg})
    });
});

var port = 7101;
app.listen(port);
console.log("api server started at:" + port);