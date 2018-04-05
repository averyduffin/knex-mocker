import Knex from 'knex';
import moment from 'moment';
import async from 'async';
import fs from 'fs';
import { runCommand, getMySQLConnection, getPGConnection } from './utils'

const TMP_SQL_FILE = 'tmpdump.sql'

let mockKnexConfig = null;

// creates a copy of database in a test schema returns the new knex object
export const mock = (knexConfig, callback) => {
    mockKnexConfig = JSON.parse(JSON.stringify(knexConfig));
    mockKnexConfig.connection.database = `mock_${knexConfig.connection.database}_${moment.utc()}`;

    const done = (err) => {
        fs.unlink(TMP_SQL_FILE, (error) => {
            if (err) return callback(err);
            if (error) return callback(error);
            const mockDB = Knex(mockKnexConfig);
            
            mockDB.remove = (cb) => {
                if (mockKnexConfig.client ===  'mysql') {
                    mysqlTearDown(mockKnexConfig, cb);
                } else if (knexConfig.client ===  'pg' || knexConfig.client ===  'postgres') {
                    pgTearDown(mockKnexConfig, cb);
                } else {
                    cb(new Error('not supporting anthying but mysql for the moment.'));
                }
            };

            callback(null, mockDB)
        });
    }
    
    if (knexConfig.client ===  'mysql') {
        mysqlMock(mockKnexConfig, knexConfig, done);
    } else if (knexConfig.client ===  'pg' || knexConfig.client ===  'postgres') {
        pgMock(mockKnexConfig, knexConfig, done);
    } else {
        callback(new Error('not supporting anthying but mysql for the moment.'));
    }
};

const mysqlMock = (mockConfig, origConfig, callback) => {
    const tasks = [
        `mysqldump ${getMySQLConnection(mockConfig.connection)} --no-data ${origConfig.connection.database} > ${TMP_SQL_FILE}`,
        `mysqladmin ${getMySQLConnection(mockConfig.connection)} create ${mockConfig.connection.database}`,
        `mysql ${getMySQLConnection(mockConfig.connection)} ${mockConfig.connection.database} < ${TMP_SQL_FILE}`,
    ];

    async.eachSeries(tasks, runCommand, (err) => {
        if (err) { return callback(err); }
        return callback();
        
    });
};

const mysqlTearDown = (mockConfig, callback) => {
    const cmd = `mysql ${getMySQLConnection(mockKnexConfig.connection)} --execute=\"DROP DATABASE ${mockKnexConfig.connection.database}\"`
    runCommand(cmd, (err, data) => {
        callback(err)
    });
};

const pgMock = (mockConfig, origConfig, callback) => {
    const tasks = [
        `pg_dump --schema-only --dbname=${getPGConnection(origConfig.connection)} > ${TMP_SQL_FILE}`,
        `sudo -u postgres createdb ${mockConfig.connection.database}`,
        `sudo -u postgres psql --command="grant all privileges on database ${mockConfig.connection.database} to ${mockConfig.connection.user}"`,
        `psql --dbname=${getPGConnection(mockConfig.connection)} < ${TMP_SQL_FILE}`
    ];
    async.eachSeries(tasks, runCommand, (err) => {
        if (err) { return callback(err); }
        return callback();
    });  
}

const pgTearDown = (mockConfig, callback) => {
    const cmd = `sudo -u postgres psql --command="DROP DATABASE ${mockKnexConfig.connection.database};"`
    runCommand(cmd, (err, data) => {
        callback(err)
    });
};