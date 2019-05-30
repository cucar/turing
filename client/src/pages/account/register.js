import React from 'react';
import callApi from '../../utils/callApi';
import { showSuccess } from '../../utils/notifications';
import TuringForm from '../../shared/turingForm';

/**
 * shows registration / sign up screen
 */
export default function Registration() {
	
	/**
	 * checkout event handler - tokenize the entered card and call the server to collect the charges
	 */
	const register = async (fields) => {
		
		// call server with the entered inputs to register the customer
		const response = await callApi('customers', fields, 'POST');
		console.log(response);
		if (!response) return;
		showSuccess(`Registration successful. Customer ID: ${JSON.stringify(response)}`);
		
		// save customer info to local storage along with session token so that it can be called for authorization requiring API calls in the future
		
		// redirect to my account page
		
	};
	
	return (<>
		<h1>Registration</h1>
		
		<TuringForm
			fields={[
				{ id: 'email',  type: 'text', label: 'Email', validators: [ 'required', 'email' ] },
				{ id: 'name',  type: 'text', label: 'Name', validators: [ 'required' ] },
				{ id: 'password',  type: 'password', label: 'Password', validators: [ 'required', 'password' ] },
				{ id: 'password_confirm',  type: 'password', label: 'Password Confirmation', validators: [ 'required', 'password-confirm' ] }
			]}
			buttons={[
				{ id: 'register', label: 'Register', onClick: register }
			]}
		/>
	</>);
}