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
	numUsers: {
		type: Number,
	},
	times: [{username: String, time: Number, penalty: Number}],
	currentTime: [{username: String, time: Number, penalty: Number}],
})

var Room = module.exports = mongoose.model('Room', RoomSchema)


// -- Helper functions for Mongo database --
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

module.exports.comparePassword = (candidatePassword, hash, callback) => {
	bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.deleteRoom = (roomID, callback) => {
	Room.remove({_id : mongo.ObjectID(roomID.toString())}, (err) => {
		if (err) throw err;
		callback();
	})
}

module.exports.getAllRooms = (query, callback) => {
	Room.find(query, {name: 1, event: 1, users: 1, _id: 1, password: 1}, (err, docs) => {
		if (err) throw err;
		callback(docs);
	})
}

module.exports.getRoomByID = (roomID, callback) => {
	var query = {_id : mongo.ObjectID(roomID.toString())}
	Room.findOne(query, (err, doc) => {
		if (err) throw err;
		callback(doc);
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
		Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$push: {times: doc.currentTime}, $set: {currentTime: []}}, {new: true}, (err2, docc) => {
			if (err2) throw err2;
			callback(docc);
		})
	})
}

module.exports.updateNumUsers = (r, callback) => {
	Room.findOne({_id : mongo.ObjectID(r.toString())}, (err, doc) => {
		if (err) throw err;
		Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$set: {numUsers: doc.users.length}}, {new: true}, (err2, docc) => {
			if (err2) throw err2;
			callback(docc);
		})
	})
}

module.exports.decNumUsers = (r, callback) => {
	Room.findOneAndUpdate({_id : mongo.ObjectID(r.toString())}, {$inc: {numUsers: -1}}, {new: true}, (err, doc) => {
		if (err) throw err;
		callback(doc);
	})
}