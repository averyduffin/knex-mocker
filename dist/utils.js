'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getPGConnection = exports.getMySQLConnection = exports.runCommand = undefined;

var _child_process = require('child_process');

var runCommand = exports.runCommand = function runCommand(cmd, callback) {
	(0, _child_process.exec)(cmd, function (err, data) {
		if (err) console.log(err.toString());
		callback(err, data);
	});
};

var getMySQLConnection = exports.getMySQLConnection = function getMySQLConnection(_ref) {
	var user = _ref.user,
	    password = _ref.password,
	    host = _ref.host;

	return '--user=' + user + ' --password=' + password + ' --host=' + host;
};

var getPGConnection = exports.getPGConnection = function getPGConnection(_ref2) {
	var user = _ref2.user,
	    password = _ref2.password,
	    host = _ref2.host,
	    database = _ref2.database;

	return 'postgres://' + user + ':' + password + '@' + host + '/' + database;
};