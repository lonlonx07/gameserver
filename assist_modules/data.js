authorize_users = {'lonlonx':'12345678'}
players = {}
dictionary = {}

function sec_stamp(){
    return parseInt(Date.now()/1000);
}

function generate_random(){
    let string_set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let rnd = "";
	for(let i=0; i<10; i++){
		rnd += string_set[Math.floor(Math.random() * string_set.length)];
	}

	return rnd;
}

function mthd_check_room(room_id){
    if(players[room_id] == undefined){
        return false;
    }
    else{
        return true;
    }
}

function mthd_verify_access_key(data){
    if(authorize_users[data[1]] != undefined && authorize_users[data[1]] == data[2]){
        return data[2];
    }
    else{
        return false;
    }
}

function identify_data_type(room_id, player_ind, var_cont, ind, val){
    if(val == "int"){
        var_cont[ind] = 0;
    }
    else if(val == 'string'){
        var_cont[ind] = '';
    }
    else if(val == 'room_id'){
        var_cont[ind] = room_id;
    }
    else if(val == 'player_ind'){
        var_cont[ind] = player_ind;
    }
    else if(val == 'array'){
        var_cont[ind] = [];
    }
    else{
        var_cont[ind] = val;
    }
}

function set_room(room_id, arr){
    players[room_id] = {}
    players[room_id]['stamp'] = sec_stamp();
    players[room_id]['players'] = 0;

    for(let i=0; i<arr.length; i++){
        identify_data_type(room_id, '', players[room_id], arr[i][0], arr[i][1]);
    }    
}

function mthd_room_generator(data){
    let room_id = "";
    do{
        room_id = generate_random();
        if(players[room_id] == undefined || Object.keys(players[room_id]).length == 0){
            set_room(room_id, data);
            break;
        }
        else{
            if(sec_stamp()-players[room_id]['stamp'] >= 3600){
                delete players[room_id];
                set_room(room_id, data);
                break;
            }
        }
	} while(1);
    
    return room_id;
}

function set_player(room_id, ind, arr){
    players[room_id][ind] = {}
    players[room_id][ind]['stamp'] = sec_stamp();

    for(let i=0; i<arr.length; i++){
        identify_data_type(room_id, ind, players[room_id][ind], arr[i][0], arr[i][1]);
    }
  
   // players[room_id]['players']++;
}

function mthd_player_generator(room_id, data){
    let ind = 1;
    if(players[room_id]['max_players'] == players[room_id]['players']){
        return "room-error-2";
    }

    do{
        if(players[room_id][ind] == undefined){
            set_player(room_id, ind, data);
            break;
        }
        else{
            if(sec_stamp()-players[room_id][ind]['stamp'] >= 10 && players[room_id][ind]['status'] == "suspended"){
                delete players[room_id][ind];
                set_player(room_id, ind, data);
                break;
            }
        }
        
        ind++;
    } while(1);
    
    return ind;
}

function mthd_get_data(data){
    let room_id = data[2];
    let player_ind = data[3];
    let ret = "";

    if(data[4] == "*"){
        players[room_id]['stamp'] = sec_stamp();
        ret = players[room_id];
    }
    else if(data[4] == "admin"){
        ret = [players, sec_stamp()];
    }
    else{
        players[room_id]['stamp'] = sec_stamp();
        ret = players[room_id][player_ind];
    }

    return ret;
}

function mthd_set_data(data){
    let room_id = data[2];
    let player_ind = data[3];
    let ret = "";

    players[room_id]['stamp'] = sec_stamp();
    if(data[1] == "resume"){
        players[room_id][player_ind]['status'] = 'active';
        players[room_id]['players']++;
    }
    else if(data[1] == "suspend"){
        players[room_id][player_ind]['status'] = 'suspended';
        players[room_id]['players']--;
    }
    else{
        if(player_ind == ""){
            players[room_id] = data[5];
        }
        else{
            players[room_id][player_ind][data[1]] = data[5];
        } 
    }

    if(data[4] == "*"){
        ret = players[room_id];
    }
    else{
        ret = players[room_id][player_ind];
    }

    return ret;
}

function mthd_manage_room_data(data){
    let obj = Object.keys(players);
    for(i=0; i<obj.length; i++){
        if(sec_stamp()-players[obj[i]]['stamp'] >= 3600 || players[obj[i]]['players'] <= 0){
            delete players[obj[i]];
        }
    }

    return "complete";
}

function mthd_get_room_list(data){
    let ret = [];
    let obj = Object.keys(players);
    for(let i=0; i<obj.length; i++){
        if(data == players[obj[i]]['game_id'] && players[obj[i]]['players'] < players[obj[i]]['max_players'])
            ret.push({'id':players[obj[i]]['id'], 'creator':players[obj[i]][1]['name']})
    }

    return ret;
}

module.exports.get_room_list = mthd_get_room_list;
module.exports.manage_room_data = mthd_manage_room_data;
module.exports.check_room = mthd_check_room;
module.exports.verify_access_key = mthd_verify_access_key;
module.exports.room_generator = mthd_room_generator;
module.exports.player_generator = mthd_player_generator;
module.exports.get_data = mthd_get_data;
module.exports.set_data = mthd_set_data;