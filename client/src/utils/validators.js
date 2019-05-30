/**
 * this file contains the validation routines for form inputs - this logic should correspond to the server side validation
 */
// const addressValidator = require('validator');
const emailValidator = require('email-validator');
const passwordValidator = (new (require('password-validator'))()).is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits().has().symbols();
// const phoneValidator = require('google-libphonenumber').PhoneNumberUtil.getInstance();

/**
 * validates an email
 */
const validateEmail = (email) => emailValidator.validate(email);

/**
 * validates password
 */
const validatePassword = (password) => passwordValidator.validate(password);

export { validateEmail, validatePassword };