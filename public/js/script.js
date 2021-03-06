var TIME = 0;
var timerGoing = false;
var interval;
var start;
var hostAlready = false;
var timeDetermined = true;
var time = 0;
var username = '';
var users = [];

var socket = io('/rooms/play/');

var pad = function(n,d) {
	var numZeros = d - n.toString().length;
	return new Array(numZeros + 1).join(0) + n.toString();
}

var convTime = function(time) {
	minutes = Math.floor(time * 0.01 / 60)
	if (minutes != 0) {
		return minutes.toString() + ":" + pad((time * 0.01 - minutes * 60).toFixed(2),5);
	} else {
		return (time * 0.01).toFixed(2);
	}
}

var prettify = function(time, penalty) {
	if (penalty == 1) {
		return convTime(time + 200) + "+";
	} else if (penalty == 2) {
		return "DNF(" + convTime(time) + ")";
	} return convTime(time);
}

var trueTime = function(timeObj) {
	if(timeObj.penalty == 1) {
		return timeObj.time + 200;
	} else if (timeObj.penalty == 2) {
		return Number.MAX_VALUE;
	} return timeObj.time;
}

var updateTimer = function() {
	var current = new Date();
	TIME = Math.floor((current.getTime() - start.getTime()) / 10);
	$('#timer').text(convTime(TIME));
}

var updateScroll = function(){
	var element = document.getElementById("chatColumn");
	element.scrollTop = element.scrollHeight;
}


$(document).ready(function(){
	$('#choices').hide();
	$.getJSON("/api/user_data", function(data) {
		username = data.username;
		socket.emit('user connection', [$('#room').val(), username])
	})
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').focus()
	}) // Bootstrap JS code

	$('#passwordModal').on('shown.bs.modal', function () {
		$('')
	})

	$('#ready').submit(function() {
		socket.emit('ready');
		$('#ready').blur();
		return false;
	})

	$('#chatform').submit(function() {
		if ($('#msg').val() != ''){
			socket.emit('chat message', [$('#room').val(), username, $('#msg').val()]);
			$('#msg').val('');
		}
		return false;
	})

	socket.on('chat', function(username, msg) {
		$('<div>').hide().
		append('<b>' + username + '</b>: ' + msg.replace(/</g, "&lt;").replace(/>/g, "&gt;"))
		.addClass('item').appendTo('#chat').fadeIn(300);
		updateScroll();
	});

	socket.on('user join', function(u, userss) {
		$('#chat').append($('<div>').append(u + ' has joined the room.').addClass('item'))
		$('#userTimes thead tr').append($('<th>').append(u))
		$('#userTimes tbody tr').each(function() {
			$(this).append($('<td>'));
		})
		updateScroll();
	})

	socket.on('load page', function(times, newTimes, newUsers) {
		var userHeading = $('<tr>')
		$('#newscramble').hide();
		users = newUsers;
		console.log(users);
		for (var i = 0; i < users.length - 1; i++) {
			userHeading.append($('<th>').append(users[i].username));
		}
		console.log(userHeading)
		$('#userTimes thead').append(userHeading);
		for (var j = 0; j < times.length; j++) {
			var thisRow = [];
			for (var k = 0; k < Object.keys(times[j]).length; k++) {				
				var userPos = -1;
				for (var a = 0; a < users.length; a++) {
					if (users[a].username == times[j][k].username)	userPos = a;
				}
				if (userPos >= 0) {
					thisRow[userPos] = prettify(times[j][k].time, times[j][k].penalty);
				}
			}
			var newRow = $('<tr>');
			for (var l = 0; l < thisRow.length; l++) {
				if(thisRow[l]) newRow.append($('<td>').append(thisRow[l]));
				else newRow.append('<td></td>');
			}
			$('#userTimes tbody').append(newRow);
		}

	//$('#userTimes').DataTable();
})

	socket.on('user leave', function(u, userss) {
		$('#users').empty();
		var position = 0;
		for (var i = 0; i < users.length; i++) {
			if (users[i].username == u) {
				position = i;
			}
		}
		users = userss;
		for (var i = 0; i < userss.length; i++){
			$('#users').append($('<li>').append(userss[i].username));
		}
		$('#chat').append($('<li>').append(u + ' has left the room.'))
		updateScroll();
		$('#userTimes tr').each(function (index) {
			$(this).find(':nth-child(' + (position + 1) + ')').remove()
		})
	})

	socket.on('redirect', function() {
		window.location.href = '/rooms'
	})

	socket.on('new host', function(newHost) {
		if (!hostAlready && newHost == username) {
			$('#chat').append($('<li>').append('<i>You are now the new host of this room.</i>'))
			hostAlready = true;
			$('#newscramble').show();
		}
	})

	socket.on('new scramble', function(scr) {
		$('#chat').append($('<li>').append('<i>New scramble!</i>'));
		updateScroll();
		$('#scramble').text(scr.replace(/<br>/g,' '));
		$('#newscramble').addClass('disabled');
		timeDetermined = false;
	})

	$(window).keydown(function(event){
		if(!timeDetermined && event.target.tagName.toLowerCase() !== 'input' && event.target.tagName.toLowerCase() !== 'button') {
			if (timerGoing) {
				clearInterval(interval);
				timerGoing = false;
				time = TIME;
				timeDetermined = true;
				$('#choices').show();	
			}
			if (event.keyCode == 32) {
				return false;
			}
		}
	})

	$(window).keyup(function(event) {
		if(!timeDetermined && event.target.tagName.toLowerCase() !== 'input' && event.target.tagName.toLowerCase() !== 'button'){
			if(!timerGoing && event.keyCode == 32) {
				TIME = 0; 
				start = new Date();
				interval = setInterval(updateTimer, 10);
				timerGoing = true;
				return false;
			}
		}
	})

	$('#nopenalty').click(function () {		
		$('#choices').hide();
		socket.emit('new time', username, time, 0);
		$('#newscramble').removeClass('disabled')
	})

	$('#plus2').click(function () {		
		$('#choices').hide();
		socket.emit('new time', username, time, 1);
		$('#newscramble').removeClass('disabled')
	})

	$('#dnf').click(function () {		
		$('#choices').hide();
		socket.emit('new time', username, time, 2);
		$('#newscramble').removeClass('disabled')
	})

	socket.on('times', function (times) {
		var newRow = $('<tr>');
		var userPos = -1;
		var minPos = -1, min = Number.MAX_VALUE;
		for (var i = 0; i < times.length; i++) {
			if (trueTime(times[i]) < min) {
				minPos = i;
			}
		}

		for (var a = 0; a < users.length; a++) {
			for (var i = 0; i < times.length; i++) {
				userPos = -1;
				if (users[a].username === times[i].username) {
					userPos = i;
					break;
				}
			}
			if (userPos >= 0) {
				if (userPos == minPos) {
					newRow.append($('<td>').append(prettify(times[userPos].time, times[userPos].penalty)).addClass("positive"));
				} else {
					newRow.append($('<td>').append(prettify(times[userPos].time, times[userPos].penalty)));
				}
			} else {
				newRow.append($('<td>'))
			}
		}
		$('#userTimes').append(newRow);
	})
});

window.onbeforeunload = function(e) {
	socket.emit('disconnection')
}