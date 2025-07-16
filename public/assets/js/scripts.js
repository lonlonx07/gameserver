let socket = io();
const url = window.location.href;
const player_name = sessionStorage.getItem("user");

let action = "";
let room_id = "";
let player_id = "";
let in_game = false;
let index_name = {'id':'ROOM ID', 'stamp':'TIMESTAMP', 'pid':'Player ID', 'name':'Name', 'status':'Status', 'data':'Player Data'}
let errors = {
    'room-error-1':"Invalid room id!", 'room-error-2':"Room is full!"
}

function get_random_num(range){
    return (Math.floor(Math.random() * range)+1)
}

function copy_room_id(){
    let copyText = $("#room_id_dsp").html();
    navigator.clipboard.writeText(copyText);
}

function check_forms(){
    let chk_res = true;
    if(action == "join"){
        if($("#room_id").val() == "")
            chk_res = "Invalid room id!";
    }
    return chk_res;
}

function create_room(){
    action = "create";
    socket.emit("create_room", ["set_cookie", room_index, player_index]); 
}

function join_room(){
    action = "join";
    let form_res = check_forms();
    if (form_res == true){
        socket.emit("join_room", ["set_cookie", $("#room_id").val(), player_index]);
    }
    else{
        alert(form_res);
    }
}

function join_from_list(id){
    $("#room_id").val(id);
    join_room();
}

function get_session(strg){
    let session = sessionStorage.getItem(strg);
    let game_session = []
    if(session != null){
        game_session = session.split('-');
    }
            
    return game_session;
}

function set_session(strg, val){
    if(val == ""){
        sessionStorage.clear(strg);
    }
    else{
        sessionStorage.setItem(strg, val);
    }
}

function format_session(data){
    let str = "";
    for(i=0; i<data.length; i++){
        str += data[i];
        if(i<data.length-1)
            str += "-";
    }
    set_session("session", str);
}

socket.on('set_cookie', function(data) {
    if(errors[data] == undefined){
        format_session(data);
        window.location = url;
    }
    else{
        alert(errors[data]);
    }
});

socket.on('return_room_list', function(data) {
    let str = "";
    for(i=0; i<data.length; i++){
        str +="<div class='d-flex justify-content-between w-100 p-1 mb-1' style='border: solid 1px; text-align:left;'>";
        str +="<label>id: "+data[i]['id']+"</label>creator: "+data[i]['creator'];
        str +="<a id='p1_pass_turn' class='btn btn-sm btn-outline-secondary' onclick='join_from_list(\""+data[i]['id']+"\")'>JOIN</a>";
        str +="</div>";
    }
    $("#room_list").html(str);
});