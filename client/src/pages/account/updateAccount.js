import React from 'react';
import { useNavigation } from 'react-navi';
import { Card, CardContent } from '@material-ui/core';

import TuringForm, { Validators } from '../../shared/form/turingForm';
import TuringTextField from '../../shared/form/turingTextField';
import TuringPasswordField from '../../shared/form/turingPasswordField';
import TuringFormSubmitButton from '../../shared/form/turingFormSubmitButton';
import TuringFormCancelButton from '../../shared/form/turingFormCancelButton';
import { showSuccess } from '../../utils/notifications';
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
	
	return (
		<Card>
			<CardContent>
				<h1>Update Account</h1>
				
				<TuringForm endpoint="customer" method="PUT" onApiResponseReceived={customerUpdated}>
					<TuringTextField key="email" label="Email" validators={[ Validators.required, Validators.email ]} value={customer.email} />
					<TuringTextField key="name" label="Name" validators={[ Validators.required ]} value={customer.name} />
					<TuringPasswordField key="password" label="Password" validators={[ Validators.password ]} />
					<TuringPasswordField key="password_confirm" label="Password Confirmation" validators={[ Validators.passwordConfirm ]} />
					<TuringTextField key="day_phone" label="Day Phone" validators={[ Validators.phone ]} value={customer.day_phone} />
					<TuringTextField key="eve_phone" label="Evening Phone" validators={[ Validators.phone ]} value={customer.eve_phone} />
					<TuringTextField key="mob_phone" label="Mobile Phone" validators={[ Validators.phone ]} value={customer.mob_phone} />
					<br/>
					<TuringFormSubmitButton key="login" label="Update" />
					<TuringFormCancelButton key="cancel" href="/account" label="Cancel" />
				</TuringForm>
			</CardContent>
		</Card>
	);
}