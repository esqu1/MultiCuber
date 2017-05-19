var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

var RoomSchema = mongoose.Schema({
	name: {
		type: String,
	},
	event: {
		type: String,
	},
	password: {
		type: String
	},
	users: [{ username: String}]
})

var Room = module.exports = mongoose.model('Room', RoomSchema)

module.exports.createRoom = (newRoom, callback) => {
	if(!(newRoom.password == '')){
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newRoom.password, salt, (err, hash) => {
				newRoom.password = hash;
				newRoom.save(callback);
			})
		})
	} else {
		newRoom.save(callback);
	}
}

module.exports.getAllRooms = (callback) => {
	Room.find({}, {name: 1, event: 1, users: 1, _id: 1}, (err, docs) => {
		if (err) throw err;
		callback(docs);
	})
}