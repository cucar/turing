import React from 'react';
import { useNavigation } from 'react-navi';

import TuringForm from '../../shared/turingForm';
import callApi from '../../utils/callApi';
import { showSuccess } from '../../utils/notifications';
import { saveSession } from '../../utils/session';

/**
 * shows registration / sign up screen
 */
export default function Registration() {
	
	// get navigation object
	let navigation = useNavigation();
	
	/**
	 * checkout event handler - tokenize the entered card and call the server to collect the charges
	 */
	const register = async (fields) => {
		
		// call server with the entered inputs to register the customer
		// NOTE: we are not doing email validation right now by sending a test email and have the user verify by clicking on a link but we may do that in the future
		const response = await callApi('customers', fields, 'POST');
		console.log(response);
		if (!response) return;
		showSuccess(`Registration successful. Customer ID: ${response.customer.schema.customer_id}`);
		
		// save customer info to local storage along with session token so that it can be called for authorization requiring API calls in the future
		saveSession(response);
		
		// redirect to my account page
		navigation.navigate('/account');
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