// Import all our dependencies
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var defaultLimit = 10;

// some config
var defaultRoom = 'CS1402';
var roomList = ["CS1401", "CS1402", "CS1403", "CS1404", "CS1405", "CS1406"];
var rooms = {};
var liveUsers = {};
var preservedUsers = {
    'system': 1
};
roomList.forEach(function(room) {
    rooms[room.toLowerCase()] = {};
});

// overwrite proto
Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// tell express where to serve static files from
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// connect mongodb
mongoose.connect("mongodb://127.0.0.1:27017/hi-to-hey");

// create a schema for chat
var ChatSchema = mongoose.Schema({
    created: Date,
    content: String,
    username: String,
    room: String
});

// create a model from the chat schema
var Chat = mongoose.model('Chat', ChatSchema);

// allow CORS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

/*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/
// route for our index file
app.get('/', function(req, res) {
    //send the index.html in our public directory
    res.sendfile('index.html');
});

//This route is simply run only on first launch just to generate some chat history
app.get('/setup', function(req, res) {
    //Array of chat data. Each object properties must match the schema object properties
    var chatData = [{
        created: new Date(),
        content: 'Hi',
        username: 'ZhangSan',
        room: 'cs1401'
    }, {
        created: new Date(),
        content: 'Hello',
        username: 'LiSi',
        room: 'cs1402'
    }, {
        created: new Date(),
        content: 'Hi',
        username: 'WangWu',
        room: 'cs1403'
    }, {
        created: new Date(),
        content: 'Hello',
        username: 'ZhaoLiu',
        room: 'cs1404'
    }, {
        created: new Date(),
        content: 'Hi',
        username: 'WeiQi',
        room: 'cs1405'
    }, {
        created: new Date(),
        content: 'Hi',
        username: 'ZhaoShi',
        room: 'cs1406'
    }];

    //Loop through each of the chat data and insert into the database
    for (var c = 0; c < chatData.length; c++) {
        //Create an instance of the chat model
        var newChat = new Chat(chatData[c]);
        //Call save to insert the chat
        newChat.save(function(err, savedChat) {
            console.log(savedChat);
        });
    }
    //Send a resoponse so the serve would not get stuck
    res.send('created');
});

//This route produces a list of chat as filterd by 'room' query
app.post('/msg', function(req, res) {
    var limit = parseInt(req.body.limit) ? parseInt(req.body.limit) : defaultLimit;
    var condition = {
        room: req.body.room.toLowerCase()
    }
    if (req.body.lastCreated && req.body.lastCreated)
        condition.created = {
            $lt: req.body.lastCreated
        };
    Chat.find(
        condition
    ).sort({
        created: -1
    }).limit(limit).exec(function(err, msgs) {
        if (err) {} else if (msgs.length == 0) {} else {
            msgs.reverse(); // put the results into the desired order
        }
        res.json(msgs);
    });
});

/*||||||||||||||||||END ROUTES|||||||||||||||||||||*/

/*||||||||||||||||MODES|||||||||||||||||||||||*/
var normal = function(socket, data) {
    console.log('normal mode');
    //Create message
    var room = data.room.toLowerCase();
    var newMsg = new Chat({
        username: data.username,
        content: data.message,
        room: room,
        created: new Date()
    });
    //Save it to database
    newMsg.save(function(err, msg) {
        //Send message to those connected in the room
        io.in(room).emit('message created', msg);
    });
};

var calculate = function(socket, data) {
    console.log('calculate mode');
    var message = '';
    try {
        var expression = data.message.substr(1);
        var result = eval(expression);
        message = result;
    } catch (exception) {
        message = 'illegal expression'
    }
    socket.emit('calculated', {
        username: 'system',
        content: message
    });
};

function whoIsHere(socket, data) {
    var room = data.room.toLowerCase();
    var message = Object.keys(rooms[room]).toString();
    socket.emit('instructed', {
        username: 'system',
        content: message
    });
}

function howManyHere(socket, data) {
    var room = data.room.toLowerCase();
    var message = 'There are ' + Object.size(rooms[room]) + ' people in this room';
    socket.emit('instructed', {
        username: 'system',
        content: message
    });
}

var instructs = {
    'whos': whoIsHere,
    'count': howManyHere,
};

var instruct = function(socket, data) {
    console.log('instruct mode');
    console.log(data.message);
    for (key in instructs) {
        if (data.message.toLowerCase().indexOf(key) > -1) {
            instructs[key](socket, data);
            return;
        }
    }
    var message = 'illegal instruct'
    socket.emit('instructed', {
        username: 'system',
        content: message
    });
};

var mode = {
    '#': calculate,
    '$': instruct,
};

/*||||||||||||||||||END MODES|||||||||||||||||||||*/





/*||||||||||||||||SOCKET|||||||||||||||||||||||*/
//Listen for connection
io.on('connection', function(socket) {
    // Globals
    var metaUser = 'anonymous';
    var metaRoom = 'anonymous';
    var islogin = false;

    // Emit the rooms array
    socket.emit('setup', {
        rooms: roomList,
        defaultRoom: defaultRoom
    });

    // Listens for new user
    socket.on('new user', function(data) {
        var room = data.room.toLowerCase();
        var user = data.username.toLowerCase();
        if (user in preservedUsers) {
            io.to(socket.id).emit('login failed', {
                reason: 'this username is preseved'
            });
        } else if (user in liveUsers) {
            var address = socket.handshake.address;
            io.to(liveUsers[user]).emit('warning', {
                content: 'someone is trying to login by your username',
                detail: 'login address: ' + address
            });
            io.to(socket.id).emit('login failed', {
                reason: 'user has been online'
            });
        } else {
            metaUser = data.username;
            metaRoom = data.room;
            socket.join(room);
            liveUsers[user] = socket.id;
            rooms[room][user] = 1;
            //Tell all those in the room that a new user joined
            io.to(socket.id).emit('login success', {
                reason: 'yeah',
                username: data.username
            });
            io.in(room).emit('user joined', data);
        }
    });

    // Listens for a new chat message
    socket.on('new message', function(data) {
        var flag = data.message[0];
        if (mode[flag]) { // special mode
            mode[flag](socket, data);
        } else { // normal mode
            normal(socket, data);
        }
    });
    // Listens for switch room
    socket.on('switch room', function(data) {
        var user = metaUser.toLowerCase();
        var oldRoom = data.oldRoom.toLowerCase();
        var newRoom = data.newRoom.toLowerCase();
        //Handles joining and leaving rooms
        //console.log(data);
        socket.leave(oldRoom);
        delete rooms[oldRoom][user];
        socket.join(newRoom);
        rooms[newRoom][user] = 1;
        metaRoom = data.newRoom;
        io.in(oldRoom).emit('user left', data);
        io.in(newRoom).emit('user joined', data);

    });

    socket.on('disconnect', function() {
        var room = metaRoom.toLowerCase();
        var user = metaUser.toLowerCase();
        if (room in rooms && user in rooms[room]) {
            delete rooms[room][user];
            delete liveUsers[user];
        }
        var data = {
            username: metaUser,
            content: metaUser + ' has left'
        };
        io.in(room).emit('user left', data);
    });

});


/*||||||||||||||||||||END SOCKETS||||||||||||||||||*/

server.listen(2016);

console.log('Server start at 127.0.0.1:2016');
