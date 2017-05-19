$(document).ready(function(){
	var socket = io();
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').focus()
	})
});