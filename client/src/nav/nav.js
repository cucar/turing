import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import { useNavigation } from 'react-navi';

import LinkButton from '../shared/linkButton';
import { Api } from '../shared/api';
import './nav.css';

export default function Nav() {

	let navigator = useNavigation();
	
	// displaying cart product count is not implemented yet - it will be done when we do the add to cart functionality
	// we will keep the cart id in local storage
	// when we make a call to add a product to cart we will send the cart id from local storage.
	// if there was no cart id in local storage, server will create a new cart id and send it back within the same "add to cart" call.
	// client side will then store that cart id in local storage and use it for subsequent add to cart calls.
	// this component will read the cart id from local storage when it's first rendered and make an API call with it to get the current product count in cart.
	// cart product count is part of state and it will be updated when we get the response and it will be displayed.
	// after that, we will subscribe to a pub-sub event like "CartUpdate" and that event will be triggered from the add to cart screen with the new product count.
	// we will be listening to that event and when we receive the event, we will update the cart count accordingly and show it
	const [ cartProductCount ] = useState(4);
	
	/**
	 * cart icon click event handler
	 */
	const cartClicked = () => {
		navigator.navigate('/cart');
	};
	
	return (
		<div className="nav">
			<AppBar color="primary" position="static">
				<Toolbar>
					<div className="menu">
						<div className="links">
							<LinkButton variant="text" href="/">Home</LinkButton>
							<Api endpoint="departments" render={departments => departments.map(department => (
								<LinkButton key={department.department_id} variant="text" href={`/catalog?department_ids=${department.department_id}`}>{department.name}</LinkButton>
							))} />
						</div>
						<div className="cart">
							<IconButton onClick={cartClicked}>
								<Badge badgeContent={cartProductCount} color="secondary">
									<ShoppingCart className="cartIcon"/>
								</Badge>
							</IconButton>
						</div>
					</div>
				</Toolbar>
			</AppBar>
		</div>
	);
}