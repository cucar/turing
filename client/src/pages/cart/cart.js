import React, { useState } from 'react';
import { mount, route } from 'navi';

import { getSessionCartId } from '../../utils/session';
import { Api } from '../../shared/api';
import CartLists from './cartLists';

import './cart.css';
import { Card, CardContent } from '@material-ui/core';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Cart Page', view: <Cart /> })
});

/**
 * shows products in the cart
 */
function Cart() {
	
	// if there is no cart in session, we can't show it - link to catalog
	const [ cartId ] = useState(getSessionCartId());
	
	return (<>
		
		{!cartId && <Card>
			<CardContent>
				<h2>Shopping Cart</h2>
				<p>Your Shopping Cart is empty.</p>
				<LinkButton href="/catalog">Add Products</LinkButton>
			</CardContent>
		</Card>}
		
		{cartId && <Api endpoint={`shoppingcart/${getSessionCartId()}`} render={cartProducts => (
			<CartLists cartProducts={cartProducts} />
		)} />}
	</>);
}