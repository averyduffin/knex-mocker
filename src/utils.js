import { exec, spawn } from 'child_process';

export const runCommand = (cmd, callback) => {
	exec(cmd, (err, data) => {
		if (err) console.log(err.toString());
		callback(err, data);
	});
};

export const getMySQLConnection = ({user, password, host}) => {
    return `--user=${user} --password=${password} --host=${host}`;
}

export const getPGConnection = ({user, password, host, database}) => {
	return `postgres://${user}:${password}@${host}/${database}`;
}
