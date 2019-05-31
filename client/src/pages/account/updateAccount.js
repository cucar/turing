import React from 'react';
import { useNavigation } from 'react-navi';

import TuringForm, { Validators } from '../../shared/turingForm';
import TuringTextField from '../../shared/turingTextField';
import TuringPasswordField from '../../shared/turingPasswordField';
import { showSuccess } from '../../utils/notifications';
import Button from '@material-ui/core/Button/Button';
import { getSessionCustomer, updateSessionCustomer } from '../../utils/session';

/**
 * account update screen
 */
export default function UpdateAccount() {
	
	let customer = getSessionCustomer();
	let navigator = useNavigation();
	
	/**
	 * post login event handler
	 */
	const customerUpdated = async (response, fieldValues) => {
		showSuccess('Update successful.');
		updateSessionCustomer(fieldValues);
		navigator.navigate('/account');
	};
	
	return (<>
		<h1>Update Account</h1>
		
		<TuringForm api="customer" method="PUT" onApiResponseReceived={customerUpdated}>
			<TuringTextField key="email" label="Email" validators={[ Validators.required, Validators.email ]} value={customer.email} />
			<TuringTextField key="name" label="Name" validators={[ Validators.required ]} value={customer.name} />
			<TuringPasswordField key="password" label="Password" validators={[ Validators.password ]} />
			<TuringPasswordField key="password_confirm" label="Password Confirmation" validators={[ Validators.passwordConfirm ]} />
			<TuringTextField key="day_phone" label="Day Phone" validators={[ Validators.phone ]} value={customer.day_phone} />
			<TuringTextField key="eve_phone" label="Evening Phone" validators={[ Validators.phone ]} value={customer.eve_phone} />
			<TuringTextField key="mob_phone" label="Mobile Phone" validators={[ Validators.phone ]} value={customer.mob_phone} />
			<br/>
			<Button key="login" variant="contained" color="primary">Update</Button>
		</TuringForm>
	</>);
}