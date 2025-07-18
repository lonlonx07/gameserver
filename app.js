const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 10001;

app.use(express.static(__dirname+'/public'));
const mod_data = require('./assist_modules/data');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/pages/home.html');
});

app.get('/game/:title', (req, res) => {
	res.sendFile(__dirname + '/pages/'+req.params['title']+'.html');
});

app.get('/admin', (req, res) => {
	res.sendFile(__dirname + '/pages/server_monitor.html');
});

io.on('connection', (socket) => {

    socket.on('server_data', data => {
        res = mod_data.get_data(data);
        io.to(socket.id).emit("rooms_data", res);
	});

    socket.on('admin_request', data => {
        res = mod_data.manage_room_data(data);
        io.to(socket.id).emit("admin_request_complete", res);
	});

    socket.on('verify_access_key', data => {
        let res = mod_data.verify_access_key(data);
        io.to(socket.id).emit("access_verification_result", res);
	});

    socket.on('room_list', data => {
        let res = mod_data.get_room_list(data);
        io.to(socket.id).emit("return_room_list", res);
	});
    
    socket.on('create_room', data => {
        let room_id = mod_data.room_generator(data[1]);
        let player_ind = mod_data.player_generator(room_id, data[2]);
        socket.join(room_id);
        let res = [room_id, player_ind];
        io.to(socket.id).emit(data[0], res);
	});

    socket.on('join_room', data => {
        let room_id = data[1];
        let player_ind;
        let res;
        let chk_res = mod_data.check_room(room_id);
        if(chk_res){
            res = mod_data.player_generator(room_id, data[2]);
            if(res != "room-error-2"){
                socket.join(room_id);
                player_ind = res;
                res = [room_id, player_ind];
            }
        }
        else{
            res = "room-error-1";
        }
        io.to(socket.id).emit(data[0], res);
	});

    socket.on('rejoin_room', data => {
        let room_id = data[2];
        let chk_res = mod_data.check_room(room_id);
        if(chk_res){
            socket.join(room_id);
            res = mod_data.set_data(data);    
            //io.to(room_id).emit("room_data", [res, data[1], data[3]]);
        }
        else{
            io.to(socket.id).emit("room_data", ["room-error", data[1], data[3]]);
        }
    });

    socket.on('command', data => {
        let room_id = data[2];
        let res;
        let chk_res = mod_data.check_room(room_id);
        if(chk_res){
            if(data[0] == "get"){
                res = mod_data.get_data(data);
            }
            else if(data[0] == "set"){
                res = mod_data.set_data(data);
            }

            if(data[1] == "target"){
                io.to(room_id).emit("player_data", [res, data[1], data[3]]);
            }
            else{
                io.to(room_id).emit("room_data", [res, data[1], data[3]]);
            }
            
        }
        else{
            io.to(socket.id).emit("room_data", ["room-error", data[1], data[3]]);
        }
	});

});

http.listen(port, () => {
    console.log(`Socket.IO server running at localhost:${port}/`);
});