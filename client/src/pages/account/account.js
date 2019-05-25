import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Account Page', view: <Account /> })
});

/**
 * shows account information for the logged in user
 */
function Account() {
	return (<>
		<h1>Account</h1>
		<LinkButton variant="contained" color="primary" href="/order">Order</LinkButton>
	</>);
}