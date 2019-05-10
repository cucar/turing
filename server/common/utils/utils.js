/**
 * miscellaneous utilities that can be used everywhere
 */
class Utils {

	/**
	 * promise delay function that can be used with async/await and promises
	 * @param {Number} seconds - seconds
	 */
	static wait(seconds) {
		return new Promise(resolve => setTimeout(resolve, seconds * 1000));
	}
}

module.exports = Utils;
