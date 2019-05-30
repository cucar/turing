import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

import './account.css';

import routeAuth from '../../utils/routeAuth';
import Registration from './register';
import Login from './login';
import Logout from './logout';
import UpdateAccount from './updateAccount';
import { getSessionCustomer } from '../../utils/session';

export default mount({
	'/': routeAuth({ title: 'Turing Account Page', view: <Account /> }),
	'/register': route({ title: 'Sign Up', view: <Registration /> }),
	'/login': route({ title: 'Login', view: <Login /> }),
	'/logout': route({ title: 'Logout', view: <Logout /> }),
	'/update/account': route({ title: 'Update Account', view: <UpdateAccount /> })
});

/**
 * shows account information for the logged in user
 */
function Account() {
	
	let customer = getSessionCustomer();
	
	return (<>
		<h1>My Account</h1>
		
		<p>Welcome {customer.name},</p>
		
		<p>Please click on one of the options below to view/update your information</p>
		
		<div className="operations">
			<LinkButton variant="contained" color="primary" href="/account/update/account">Update Account</LinkButton>
			<LinkButton variant="contained" color="primary" href="/account/update/address">Update Address</LinkButton>
			<LinkButton variant="contained" color="primary" href="/account/update/payment">Update Card On File</LinkButton>
		</div>
	</>);
}