import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';

import { validateEmail, validatePassword } from '../utils/validators';

/**
 * turing form component - takes in fields, buttons and submit event handler function - displays the inputs and calls submit with the entered values when user clicks on buttons
 * example value for fields:
 * [
 * 		{ id: 'email', type: 'text', label: 'Email', validators: [ 'required', 'email' ] },
 * 		{ id: 'name', type: 'text', label: 'Name', validators: [ 'required' ], value: 'Test User' },
 *		{ id: 'region', type: 'select', label: 'Shipping Region', options: [ { label: 'US', value: 1 }, { label: 'Canada', value: 2 } ] }
 * ]
 * example value for buttons - onClick function would be called with the values of the inputs at the time of button click:
 * [
 *     { id: 'register', label: 'Register', onClick: register }
 * ]
 */
function TuringForm({ fields, buttons }) {
	
	// input values and errors will be kept in the component state
	let initialValues = {};
	let initialErrors = {};
	for (let field of fields) initialValues[field.id] = field.value || '';
	for (let field of fields) initialErrors[field.id] = '';
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
		if (!field.hasOwnProperty('validators') || !field.validators) return '';
		
		// required validation - check if field is entered
		if (field.validators.find(validator => validator === 'required') && !fieldValues[field.id]) return 'Required.';
		
		// email validation - check if field format is correct
		if (field.validators.find(validator => validator === 'email') && !validateEmail(fieldValues[field.id])) return 'Invalid email.';
		
		// password validation - check if field format is correct
		if (field.validators.find(validator => validator === 'password') && !validatePassword(fieldValues[field.id]))
			return 'Passwords need to be between 8 and 100 characters with at least one uppercase, one lowercase, one number and one special character like punctuation.';
		
		// password confirmation validation - check if both entered passwords are the same
		if (field.validators.find(validator => validator === 'password-confirm') && fieldValues[field.id] !== fieldValues.password)
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
		for (let field of fields) errors[field.id] = validateField(field);
		return errors;
	};
	
	/**
	 * returns if there are any invalid fields
	 */
	const invalidFields = (errors) => {
		
		// now check if there are any fields with errors - if so, fields are NOT validated
		for (let field of fields) if (errors[field.id]) return true;
		
		// looks like no field has error - that means fields are validated - return true - we can continue with form submission
		return false;
	};
	
	/**
	 * callback handler for form submission - we have to use higher level function to be able to pass in the button ids
	 */
	const buttonClick = buttonId => () => {
		
		// validate each field and get error messages for each field
		const newFieldErrors = validateFields();
		
		// if there are invalid fields, do not submit the form and display errors - otherwise call the click handler in the parent with the field values
		if (invalidFields(newFieldErrors)) setFieldErrors(newFieldErrors);
		else buttons.find(button => button.id === buttonId).onClick(fieldValues);
	};
	
	// render form inputs
	return (<>
		
		{fields.map(field =>
			<div key={field.id}>
				
				{field.type === 'text' &&
					<TextField key={field.id + 'input'}
							   style={{ width: '100%' }}
							   label={field.label}
							   value={fieldValues[field.id]}
							   error={!!fieldErrors[field.id]}
							   helperText={fieldErrors[field.id]}
							   onChange={setFieldValue(field.id)} />
				}
				
				{field.type === 'password' &&
					<TextField key={field.id + 'input'}
							   style={{ width: '100%' }}
							   label={field.label}
							   error={!!fieldErrors[field.id]}
							   helperText={fieldErrors[field.id]}
							   type="password"
							   value={fieldValues[field.id]}
							   onChange={setFieldValue(field.id)} />
				}
			</div>
		)}
		
		<br/>
		
		{buttons.map(button =>
			<Button key={button.id} variant="contained" color="primary" onClick={buttonClick(button.id)}>{button.label}</Button>
		)}
	</>);
}

TuringForm.propTypes = {
	fields: PropTypes.array.isRequired,
	buttons: PropTypes.array.isRequired
};

export default TuringForm;