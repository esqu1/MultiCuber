var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

var RoomSchema = mongoose.Schema({
	name: {
		type: String,
	},
	event: {
		type: String,
	},
	idNumber: {
		type: String,
		index: true
	},
	users: [{ username: String}]
})

var Room = module.exports = mongoose.model('Room', RoomSchema)

module.exports.createRoom = (newRoom, callback) => {
    newRoom.save(callback);
}