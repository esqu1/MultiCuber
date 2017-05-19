$(document).ready(function(){	
	var socket = io();
	var username = '';
	$.getJSON("/api/user_data", function(data) {
		username = data.username;
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
	})
});