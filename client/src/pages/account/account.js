import React from 'react';
import { mount, route } from 'navi';
import { Card, CardContent, CardActions } from '@material-ui/core';

import './account.css';

import { getSessionCustomer } from '../../utils/session';
import LinkButton from '../../shared/linkButton';
import routeAuth from '../../utils/routeAuth';
import Registration from './register';
import Login from './login';
import Logout from './logout';
import UpdateAccount from './updateAccount';
import UpdateAddress from './updateAddress';
import UpdatePayment from './updatePayment';
import Orders from './orders';
import OrderDetail from './orderDetail';
import Reviews from './reviews';

export default mount({
	'/': routeAuth({ title: 'Turing Account Page', view: <Account /> }),
	'/register': route({ title: 'Sign Up', view: <Registration /> }),
	'/login': route({ title: 'Login', view: <Login /> }),
	'/logout': routeAuth({ title: 'Logout', view: <Logout /> }),
	'/update/account': routeAuth({ title: 'Update Account', view: <UpdateAccount /> }),
	'/update/address': routeAuth({ title: 'Update Address', view: <UpdateAddress /> }),
	'/update/payment': routeAuth({ title: 'Update Credit Card On File', view: <UpdatePayment /> }),
	'/orders': routeAuth({ title: 'My Orders', view: <Orders /> }),
	'/orders/:id': routeAuth(req => ({ title: 'My Orders', view: <OrderDetail orderId={req.params.id}/> })),
	'/reviews': routeAuth({ title: 'My Reviews', view: <Reviews /> })
});

/**
 * shows account information for the logged in user
 */
function Account() {
	
	let customer = getSessionCustomer();
	
	return (
		<Card>
			<CardContent>
				<h1>My Account</h1>
				
				<p>Welcome {customer.name},</p>
				
				<p>Please click on one of the options below to view/update your information</p>
			</CardContent>
			<CardActions>
				<div className="operations">
					<LinkButton variant="contained" color="primary" href="/account/update/account">Update Account</LinkButton>
					<LinkButton variant="contained" color="primary" href="/account/update/address">Update Address</LinkButton>
					<LinkButton variant="contained" color="primary" href="/account/update/payment">Update Card On File</LinkButton>
					<LinkButton variant="contained" color="primary" href="/account/orders">My Orders</LinkButton>
					<LinkButton variant="contained" color="primary" href="/account/reviews">My Reviews</LinkButton>
				</div>
			</CardActions>
		</Card>
	);
}