import React, { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import { useNavigation } from 'react-navi';

import LinkButton from '../shared/linkButton';
import { Api } from '../shared/api';
import './nav.css';
import { getSessionCartProductCount } from '../utils/session';
import PubSub from 'pubsub-js';

export default function Nav() {

	let navigator = useNavigation();
	
	// after that, we will subscribe to a pub-sub event like "CartUpdate" and that event will be triggered from the add to cart screen with the new product count.
	// we will be listening to that event and when we receive the event, we will update the cart count accordingly and show it
	const [ cartProductCount, setCartProductCount ] = useState(getSessionCartProductCount());
	
	/**
	 * subscribe to the cart update queue - this is going to be populated by the product detail page when a product gets added to cart
	 */
	useEffect(() => {
		PubSub.subscribe('CartUpdate', (msg, productCount) => setCartProductCount(productCount));
		return () => PubSub.unsubscribe('CartUpdate');
	});
	
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
								{cartProductCount > 0 && <Badge badgeContent={cartProductCount} color="secondary"><ShoppingCart className="cartIcon"/></Badge>}
								{cartProductCount === 0 && <ShoppingCart className="cartIcon"/>}
							</IconButton>
						</div>
					</div>
				</Toolbar>
			</AppBar>
		</div>
	);
}