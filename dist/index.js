'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mock = undefined;

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TMP_SQL_FILE = 'tmpdump.sql';

var mockKnexConfig = null;

// creates a copy of database in a test schema returns the new knex object
var mock = exports.mock = function mock(knexConfig, callback) {
    mockKnexConfig = JSON.parse(JSON.stringify(knexConfig));
    mockKnexConfig.connection.database = 'mock_' + knexConfig.connection.database + '_' + _moment2.default.utc();

    var done = function done(err) {
        _fs2.default.unlink(TMP_SQL_FILE, function (error) {
            if (err) return callback(err);
            if (error) return callback(error);
            var mockDB = (0, _knex2.default)(mockKnexConfig);

            mockDB.remove = function (cb) {
                if (mockKnexConfig.client === 'mysql') {
                    mysqlTearDown(mockKnexConfig, cb);
                } else if (knexConfig.client === 'pg' || knexConfig.client === 'postgres') {
                    pgTearDown(mockKnexConfig, cb);
                } else {
                    cb(new Error('not supporting anthying but mysql for the moment.'));
                }
            };

            callback(null, mockDB);
        });
    };

    if (knexConfig.client === 'mysql') {
        mysqlMock(mockKnexConfig, knexConfig, done);
    } else if (knexConfig.client === 'pg' || knexConfig.client === 'postgres') {
        pgMock(mockKnexConfig, knexConfig, done);
    } else {
        callback(new Error('not supporting anthying but mysql for the moment.'));
    }
};

var mysqlMock = function mysqlMock(mockConfig, origConfig, callback) {
    var tasks = ['mysqldump ' + (0, _utils.getMySQLConnection)(mockConfig.connection) + ' --no-data ' + origConfig.connection.database + ' > ' + TMP_SQL_FILE, 'mysqladmin ' + (0, _utils.getMySQLConnection)(mockConfig.connection) + ' create ' + mockConfig.connection.database, 'mysql ' + (0, _utils.getMySQLConnection)(mockConfig.connection) + ' ' + mockConfig.connection.database + ' < ' + TMP_SQL_FILE];

    _async2.default.eachSeries(tasks, _utils.runCommand, function (err) {
        if (err) {
            return callback(err);
        }
        return callback();
    });
};

var mysqlTearDown = function mysqlTearDown(mockConfig, callback) {
    var cmd = 'mysql ' + (0, _utils.getMySQLConnection)(mockKnexConfig.connection) + ' --execute="DROP DATABASE ' + mockKnexConfig.connection.database + '"';
    (0, _utils.runCommand)(cmd, function (err, data) {
        callback(err);
    });
};

var pgMock = function pgMock(mockConfig, origConfig, callback) {
    var tasks = ['pg_dump --schema-only --dbname=' + (0, _utils.getPGConnection)(origConfig.connection) + ' > ' + TMP_SQL_FILE, 'sudo -u postgres createdb ' + mockConfig.connection.database, 'sudo -u postgres psql --command="grant all privileges on database ' + mockConfig.connection.database + ' to ' + mockConfig.connection.user + '"', 'psql --dbname=' + (0, _utils.getPGConnection)(mockConfig.connection) + ' < ' + TMP_SQL_FILE];
    _async2.default.eachSeries(tasks, _utils.runCommand, function (err) {
        if (err) {
            return callback(err);
        }
        return callback();
    });
};

var pgTearDown = function pgTearDown(mockConfig, callback) {
    var cmd = 'sudo -u postgres psql --command="DROP DATABASE ' + mockKnexConfig.connection.database + ';"';
    (0, _utils.runCommand)(cmd, function (err, data) {
        callback(err);
    });
};