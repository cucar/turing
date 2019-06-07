import React, { useState, cloneElement } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button/Button';

import TuringTextField from './turingTextField';
import TuringPasswordField from './turingPasswordField';
import TuringSelectField from './turingSelectField';
import LinkButton from './linkButton';
import { validateCountry, validateEmail, validatePassword, validatePhone, validateZip } from '../utils/validators';
import callApi from '../utils/callApi';

// validator constants to be exported
export const Validators = {
	required: 'required',
	email: 'email',
	password: 'password',
	passwordConfirm: 'passwordConfirm',
	phone: 'phone',
	zip: 'zip',
	country: 'country'
};

// input and button elements that can be used with the form
const allowedInputs = [ TuringTextField, TuringPasswordField, TuringSelectField ];
const allowedButtons = [ Button, LinkButton ];

/**
 * turing form component - takes in fields, buttons and submit event handler function - displays the inputs and calls submit with the entered values when user clicks on buttons
 */
function TuringForm({ endpoint, method, getApiParams = fieldValues => fieldValues, onApiResponseReceived, children }) {

	// build fields, buttons and other elements array from children
	let fields = children.filter(child => allowedInputs.includes(child.type));
	let buttons = children.filter(child => allowedButtons.includes(child.type));
	let otherElements = children.filter(child => !Array.isArray(child) && !allowedInputs.concat(allowedButtons).includes(child.type));
	
	// when the fields are rendered from an array, they show up as children of an array child - process them separately here - we should do buttons and others as well later
	children.forEach(child => { if (Array.isArray(child)) for (let grandChild of child) if (allowedInputs.includes(grandChild.type)) fields.push(grandChild); });
	
	// input values and errors will be kept in the component state
	let initialValues = {};
	let initialErrors = {};
	for (let field of fields) initialValues[field.key] = field.props.value || '';
	for (let field of fields) initialErrors[field.key] = '';
	const [ fieldValues, setFieldValues ] = useState(initialValues);
	const [ fieldErrors, setFieldErrors ] = useState(initialErrors);
	
	/**
	 * callback handler for input changes - we have to use higher level function to be able to pass in the field ids
	 */
	const setFieldValue = fieldId => event => {
		let newValue = {};
		newValue[fieldId] = event.target.value;
		setFieldValues({...fieldValues, ...newValue });
	};
	
	/**
	 * validates a field after form submission
	 */
	const validateField = (field) => {
		
		// if there are no validators for the field, we're all good
		if (!field.props.hasOwnProperty('validators') || !field.props.validators) return '';
		
		// required validation - check if field is entered
		if (field.props.validators.find(validator => validator === Validators.required) && !fieldValues[field.key]) return 'Required.';
		
		// email validation
		if (field.props.validators.find(validator => validator === Validators.email) && !validateEmail(fieldValues[field.key])) return 'Invalid email.';
		
		// phone validation
		if (field.props.validators.find(validator => validator === Validators.phone) && !validatePhone(fieldValues[field.key])) return 'Invalid phone.';
		
		// zip code validation
		if (field.props.validators.find(validator => validator === Validators.zip) && !validateZip(fieldValues[field.key], fieldValues['country'])) return 'Invalid postal code.';
		
		// country validation
		if (field.props.validators.find(validator => validator === Validators.country) && !validateCountry(fieldValues[field.key]))
			return (fieldValues[field.key] === 'United States' || fieldValues[field.key] === 'USA' ? 'Please use 2 letter country code: US.' : 'Invalid country code.');
		
		// password validation
		if (field.props.validators.find(validator => validator === Validators.password) && !validatePassword(fieldValues[field.key]))
			return 'Passwords need to be between 8 and 100 characters with at least one uppercase, one lowercase, one number and one special character like punctuation.';
		
		// password confirmation validation - check if both entered passwords are the same
		if (field.props.validators.find(validator => validator === Validators.passwordConfirm) && fieldValues[field.key] !== fieldValues.password)
			return 'Passwords do not match.';
		
		// all validations passed - no error
		return '';
	};
	
	/**
	 * returns if the fields are valid to continue with submission - updates field error display as a side effect
	 */
	const validateFields = () => {
		
		// object that holds error messages for each field
		let errors = {};
		
		// do field validations with current values and get error messages for each one
		for (let field of fields) errors[field.key] = validateField(field);
		return errors;
	};
	
	/**
	 * returns if there are any invalid fields
	 */
	const invalidFields = (errors) => {
		
		// now check if there are any fields with errors - if so, fields are NOT validated
		for (let field of fields) if (errors[field.key]) return true;
		
		// looks like no field has error - that means fields are validated - return true - we can continue with form submission
		return false;
	};
	
	/**
	 * callback handler for form submission
	 */
	const submitForm = async () => {
		
		// validate each field and get error messages for each field
		const newFieldErrors = validateFields();
		
		// if there are invalid fields, do not submit the form and display errors - otherwise call the click handler in the parent with the field values
		if (invalidFields(newFieldErrors)) {
			setFieldErrors(newFieldErrors);
			return;
		}
		
		// button does not have an event handler - use the default event handler - do the API call and call onApiResponseReceived when we get the response back
		const response = await callApi(endpoint, getApiParams(fieldValues), method);
		
		// do not continue if there was an error - it is automatically shown
		if (!response) return;
		
		// callback with the API response
		onApiResponseReceived(response, fieldValues);
	};
	
	/**
	 * callback handler for button click - we have to use higher level function to be able to pass in the button ids
	 */
	const buttonClick = buttonId => async () => {
		
		// find the button that generated the event
		const button = buttons.find(button => button.key === buttonId);
		
		// if this is a link button, skip validation and everything - we'll just route as usual
		if (button.type === LinkButton) return;
		
		// if the button has a specific event handler, use that
		if (button.props.onClick) {
			button.props.onClick(fieldValues);
			return;
		}
		
		// now do the form submission actions - call the API
		await submitForm();
	};
	
	// render form inputs - first the form fields, then other elements and then the buttons
	return (<>

		<div className="formInputs">
			{fields.map(field => cloneElement(field, {
				id: field.key,
				value: fieldValues[ field.key ],
				error: fieldErrors[ field.key ],
				onChange: setFieldValue(field.key),
				onEnter: submitForm
			}))}
		</div>
		
		{otherElements}
		
		<div className="buttons">
			{buttons.map(button => cloneElement(button, { onClick: buttonClick(button.key) }))}
		</div>
		
	</>);
}

TuringForm.propTypes = {
	children: PropTypes.node.isRequired,
	endpoint: PropTypes.string,
	method: PropTypes.string,
	onApiResponseReceived: PropTypes.any,
	getApiParams: PropTypes.any
};

export default TuringForm;