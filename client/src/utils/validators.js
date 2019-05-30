/**
 * this file contains the validation routines for form inputs - this logic should correspond to the server side validation
 */
// const addressValidator = require('validator');
const emailValidator = require('email-validator');
const passwordValidator = (new (require('password-validator'))()).is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits().has().symbols();
const phoneValidator = require('google-libphonenumber').PhoneNumberUtil.getInstance();

/**
 * validates an email
 */
const validateEmail = (email) => emailValidator.validate(email);

/**
 * validates password (empty is a valid password - it is used in cases where the form password field is optional)
 */
const validatePassword = (password) => !password || passwordValidator.validate(password);

/**
 * validates phone - for now we only accept US phone numbers - we may extend to other countries in the future
 */
const validatePhone = (phone) => {
	if (!phone) return true; // empty is a valid - it is used in cases where the field is optional
	
	try {
		return phoneValidator.isValidNumber(phoneValidator.parse(phone, 'US'));
	}
	catch (ex) {
		return false;
	}
};

export { validateEmail, validatePassword, validatePhone };