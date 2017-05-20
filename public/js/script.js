var socket = io('/rooms/play/');
$(document).ready(function(){
	var username = '';
	$.getJSON("/api/user_data", function(data) {
		username = data.username;
		socket.emit('user connection', [$('#room').val(), username])
	})
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').focus()
	}) // Bootstrap JS code
	$('#chatform').submit(function() {
		if ($('#msg').val() != ''){
			socket.emit('chat message', [$('#room').val(), username, $('#msg').val()]);
			$('#msg').val('');
		}
		return false;
	})
	socket.on('chat ' + $('#room').val(), function(username, msg) {
		$('#chat').append($('<li>').append('<b>' + username + '</b>: ' + msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")));
	});

	// socket.on('user ' + $('#room').val(), function(users) {
	// 	for (var i = 0; i < users.length; i++){
	// 		$('#users').append($('<li>').append(users[i].username));
	// 	}
	// })

	socket.on('user join', (username) => {
		$('#users').append($('<li>').append(username));
	})
});

window.onbeforeunload = function(e) {
	socket.emit('disconnection')
}