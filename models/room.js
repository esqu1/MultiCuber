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
	users: [{username: String}],
	currentRow: {
		type: Number,
	},
	times: [{username: String, time: Number, penalty: Number}],
	currentTime: [{username: String, time: Number, penalty: Number}],
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

module.exports.deleteRoom = (roomID, callback) => {
	Room.remove({_id : mongo.ObjectID(roomID.toString())}, (err) => {
		if (err) throw err;
		callback();
	})
}

module.exports.getAllRooms = (query, callback) => {
	Room.find(query, {name: 1, event: 1, users: 1, _id: 1}, (err, docs) => {
		if (err) throw err;
		callback(docs);
	})
}

module.exports.addUserToRoom = (r, u, callback) => {
	Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$push: {users: {username: u}}}, {new: true}, (err, room) => {
		if (err) throw err;
		callback(room);
	})
}

module.exports.removeUserFromRoom = (r, u, callback) => {
	Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$pull: {users: {username: u}}}, {new: true}, (err, room) => {
		if (err) throw err;
		callback(room);
	})
}

module.exports.addTimeToRoom = (r, username, time, penalty, callback) => {
	Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$push: {currentTime: {username: username, time: time, penalty: penalty}}}, {new: true}, (err, room) => {
		if (err) throw err;
		callback(room);
	})
}

module.exports.updateTimeDatabase = (r, callback) => {
	Room.findOne({_id : mongo.ObjectID(r.toString())}, (err, doc) => {
		if (err) throw err;
		Room.update({_id : mongo.ObjectID(r.toString())}, {$push: {times: doc.currentTime}, $set: {currentTime: []}}, {new: true}, (err2, doc) => {
			if (err2) throw err2;
			callback(doc);
		})
	})
}