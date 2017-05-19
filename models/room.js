var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var mongo = require('mongodb');

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

// Room.statics.findAndModify = function (query, sort, doc, options, callback) {
//   return this.collection.findAndModify(query, sort, doc, options, callback);
// };

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

module.exports.addUserToRoom = (r, u, callback) => {
	Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$push: {users: {username: u}}}, (err, room) => {
		if (err) throw err;
		callback(room);
	})
}

module.exports.removeUserFromRoom = (r, u, callback) => {
	Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$pull: {users: {username: u}}}, (err, room) => {
		if (err) throw err;
		callback(room);
	})
}