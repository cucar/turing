import React from 'react';
import { useNavigation } from 'react-navi';

import TuringForm from '../../shared/turingForm';
import callApi from '../../utils/callApi';
import { showSuccess } from '../../utils/notifications';
import { saveSession } from '../../utils/session';

/**
 * login screen
 */
export default function Login() {
	
	// get navigation object
	let navigation = useNavigation();
	
	/**
	 * login event handler
	 */
	const login = async (fields) => {
		
		// call server with the entered inputs to login and get access token
		const response = await callApi('customers/login', fields, 'POST');
		console.log(response);
		if (!response) return;
		showSuccess('Login successful.');
		
		// save customer info to local storage along with session token so that it can be called for authorization requiring API calls in the future
		saveSession(response);
		
		// redirect to my account page
		navigation.navigate('/account');
	};
	
	return (<>
		<h1>Login</h1>
		
		<TuringForm
			fields={[
				{ id: 'email',  type: 'text', label: 'Email', validators: [ 'required', 'email' ] },
				{ id: 'password',  type: 'password', label: 'Password', validators: [ 'required', 'password' ] },
			]}
			buttons={[
				{ id: 'login', label: 'Login', onClick: login }
			]}
		/>
	</>);
}