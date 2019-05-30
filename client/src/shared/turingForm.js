import React, { useState, cloneElement } from 'react';
import PropTypes from 'prop-types';

import { validateEmail, validatePassword } from '../utils/validators';
import callApi from '../utils/callApi';

// validator constants to be exported
export const Validators = {
	required: 'required',
	email: 'email',
	password: 'password',
	passwordConfirm: 'passwordConfirm'
};

/**
 * turing form component - takes in fields, buttons and submit event handler function - displays the inputs and calls submit with the entered values when user clicks on buttons
 */
function TuringForm({ api, method, onApiResponseReceived, children }) {
	
	// build fields, buttons and other elements array from children
	const fields = children.filter(child => child.type.name && child.type.name.includes('Field'));
	console.log(fields);
	const buttons = children.filter(child => child.type.displayName && child.type.displayName.includes('Button'));
	const otherElements = children.filter(child => (!child.type.name || !child.type.name.includes('Field')) && (!child.type.displayName || !child.type.displayName.includes('Button')));
	
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
		console.log('field changing', fieldId, event.target.value);
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
		
		// email validation - check if field format is correct
		if (field.props.validators.find(validator => validator === Validators.email) && !validateEmail(fieldValues[field.key])) return 'Invalid email.';
		
		// password validation - check if field format is correct
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
	 * callback handler for form submission - we have to use higher level function to be able to pass in the button ids
	 */
	const buttonClick = buttonId => async () => {

		console.log('button clicked', buttonId);
		
		// validate each field and get error messages for each field
		const newFieldErrors = validateFields();
		
		console.log('fields checked', newFieldErrors);
		
		// if there are invalid fields, do not submit the form and display errors - otherwise call the click handler in the parent with the field values
		if (invalidFields(newFieldErrors)) {
			setFieldErrors(newFieldErrors);
			return;
		}
		
		// find the button that generated the event
		const button = buttons.find(button => button.key === buttonId);
		
		// if the button has a specific event handler, use that
		if (button.props.onClick) {
			button.props.onClick(fieldValues);
			return;
		}
		
		// button does not have an event handler - use the default event handler - do the API call and call onApiResponseReceived when we get the response back
		const response = await callApi(api, fieldValues, method);
		
		// do not continue if there was an error - it is automatically shown
		if (!response) return;
		
		// callback with the API response
		onApiResponseReceived(response);
	};
	
	let fieldElements = fields.map(field => {
		console.log(field);
		return cloneElement(field, { id: field.key, onChange: setFieldValue(field.key), value: fieldValues[ field.key ], error: fieldErrors[ field.key ] })
	});
	
	// render form inputs - first the form fields, then other elements and then the buttons
	return (<>

		{fieldElements}
		
		{otherElements}
		
		{buttons.map(button => cloneElement(button, { onClick: buttonClick(button.key) }))}
		
	</>);
}

TuringForm.propTypes = {
	children: PropTypes.node.isRequired,
	api: PropTypes.string,
	method: PropTypes.string,
	onApiResponseReceived: PropTypes.any
};

export default TuringForm;