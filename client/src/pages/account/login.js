import React from 'react';
import { useNavigation } from 'react-navi';

import TuringForm, { Validators } from '../../shared/turingForm';
import TuringTextField from '../../shared/turingTextField';
import TuringPasswordField from '../../shared/turingPasswordField';
import { showSuccess } from '../../utils/notifications';
import { saveSession } from '../../utils/session';
import Button from '@material-ui/core/Button/Button';

/**
 * login screen
 */
export default function Login() {
	
	// get navigation object
	let navigator = useNavigation();
	
	/**
	 * post login event handler
	 */
	const customerLoggedIn = async (response) => {
		
		showSuccess('Login successful.');
		
		// save customer info to local storage along with session token so that it can be called for authorization requiring API calls in the future
		saveSession(response);
		
		// redirect to my account page
		navigator.navigate('/account');
	};
	
	return (<>
		<h1>Login</h1>
		
		<TuringForm api="customers/login" method="POST" onApiResponseReceived={customerLoggedIn}>
			<TuringTextField key="email" label="Email" validators={[ Validators.required, Validators.email ]} />
			<TuringPasswordField key="password" label="Password" validators={[ Validators.required, Validators.password ]} />
			<br/>
			<Button key="login" variant="contained" color="primary">Login</Button>
		</TuringForm>
	</>);
}