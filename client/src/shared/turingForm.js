import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';

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
	
	// input values will be kept in the component state
	let initialValues = {};
	for (let field of fields) initialValues[field.id] = '';
	const [ fieldValues, setFieldValues ] = useState(initialValues);
	
	/**
	 * callback handler for input changes - we have to use higher level function to be able to pass in the field ids
	 */
	const setFieldValue = fieldId => event => {
		let newValue = {};
		newValue[fieldId] = event.target.value;
		const newFieldValues = {...fieldValues, ...newValue };
		setFieldValues(newFieldValues);
	};
	
	/**
	 * callback handler for form submission - we have to use higher level function to be able to pass in the button ids
	 */
	const buttonClick = buttonId => () => {
		buttons.find(button => button.id === buttonId).onClick(fieldValues);
	};
	
	// render form inputs
	return (<>
		
		{fields.map(field =>
			<div key={field.id}>
				
				{field.type === 'text' &&
					<TextField key={field.id + 'input'}
							   style={{ width: '100%' }}
							   label={field.label}
							   value={fieldValues[field]}
							   onChange={setFieldValue(field.id)} />
				}
				
				{field.type === 'password' &&
				<TextField key={field.id + 'input'}
						   style={{ width: '100%' }}
						   label={field.label}
						   type="password"
						   value={fieldValues[field]}
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