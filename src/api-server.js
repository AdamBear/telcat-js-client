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


app.get('/index/', function (req, res) {
    res.send("haha!");
});

app.post('/index/', function (req, res) {
    res.set({'Content-Type': 'text/json', 'Encodeing': 'utf8'});

    var item = req.body.body;
    // console.log(item);
    var msg = JSON.parse(item);
    msg.route = "onMessage";

    // item = fixItem1(item);
    // console.log(item);
    // console.log("cid:" + item.cid);

    // pomeloAdmin客户端连接服务器
    client.connect(id, config.host, config.port, function(err) {
        if(err) { return console.error('fail to connect: ' + err);}

        client.request('channelMonitor', {type: "channelMonitor", method:'sendMessage', msg:msg}, function (err, msg) {
            if (err) {return console.error('fail to request channelMonitor:' + err);}
            console.log("sendMessageSuccess:  " +
                JSON.stringify(msg));
        });
    });

    // esSource.update({
    //     index: 'weimao3',
    //     type: 'gs',
    //     id: item.cid,
    //     body: {doc: _.omit(item, "_id"), doc_as_upsert: true}
    // }, function (err) {
    //     if (err) {
    //         console.error(('failed to create document in esSource. cid:"' + item.cid + '"').bold.red);
    //         console.error(err);
    //         res.send({status: "failed", cid: req.body.body.cid, err:err});
    //     }else{
    //         bulkIndex(item, 1);
    //         res.send({status: "success", cid: req.body.body.cid})
    //     }
    // });
});

var port = 7101;
app.listen(port);
console.log("api server started at:" + port);