const _ = require('lodash');

const configPath = process.env.CONFIG_PATH;
let env = process.env.NODE_ENV;
if (!env) {
	console.log('No NODE_ENV environment variable set! It should be dev or prod! Defaulting to dev!\n');
	env = 'dev';
	process.env.NODE_ENV = env;
}

const config = require(configPath || `./../../config_${env}.js`);

/**
 * Configuration class which houses hard coded configurations and also reads from the config.js file and merges it into the class
 * @class
 */
class Config {
	constructor() {

		this.env = env;

		// read the config and merge it with this Config class
		_.assign(this, config);
	}
}

// export config object
module.exports = new Config();
