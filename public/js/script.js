$(document).ready(function(){
	var socket = io();
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').focus()
	})
	$('#chatform').submit(function() {
		if ($('#msg').val() != ''){
			socket.emit('chat message', [$('#room').val(), $('#msg').val()]);
			$('#msg').val('');
		}
		return false;
	})
	socket.on('chat ' + $('#room').val(), function(msg) {
		$('#chat').append($('<li>').text(msg));
	})
});