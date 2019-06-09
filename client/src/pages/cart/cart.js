import React from 'react';
import { mount, route } from 'navi';

import { getSessionCartId } from '../../utils/session';
import { Api } from '../../shared/api';
import CartLists from './cartLists';

import './cart.css';

export default mount({
	'/': route({ title: 'Turing Cart Page', view: <Cart /> })
});

/**
 * shows products in the cart
 */
function Cart() {
	
	return (<Api endpoint={`shoppingcart/${getSessionCartId()}`} render={cartProducts => (
		<CartLists cartProducts={cartProducts} />
	)} />);
}