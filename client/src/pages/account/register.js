import React from 'react';
import { useNavigation } from 'react-navi';
import Button from '@material-ui/core/Button/Button';

import TuringForm, { Validators } from '../../shared/turingForm';
import TuringTextField from '../../shared/turingTextField';
import TuringPasswordField from '../../shared/turingPasswordField';
import { showSuccess } from '../../utils/notifications';
import { saveSession } from '../../utils/session';

/**
 * registration / sign up screen
 */
export default function Registration() {
	
	const navigator = useNavigation();
	
	/**
	 * post register event handler
	 * NOTE: we are not doing email validation right now by sending a test email and have the user verify by clicking on a link but we may do that in the future
	 */
	const customerRegistered = async (response) => {
		
		showSuccess(`Registration successful. Customer ID: ${response.customer.schema.customer_id}`);
		
		// save customer info to local storage along with session token so that it can be called for authorization requiring API calls in the future
		saveSession(response);
		
		// redirect to my account page
		navigator.navigate('/account');
	};
	
	return (<>
		<h1>Registration</h1>
		
		<TuringForm api="customers" method="POST" onApiResponseReceived={customerRegistered}>
			<TuringTextField key="email" label="Email" validators={[ Validators.required, Validators.email ]} />
			<TuringTextField key="name" label="Name" validators={[ Validators.required ]} />
			<TuringPasswordField key="password" label="Password" validators={[ Validators.required, Validators.password ]} />
			<TuringPasswordField key="password_confirm" label="Password Confirmation" validators={[ Validators.required, Validators.passwordConfirm ]} />
			<br/>
			<Button key="register" variant="contained" color="primary">Register</Button>
		</TuringForm>
	</>);
}