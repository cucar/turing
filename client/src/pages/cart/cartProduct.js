import React, { useState, useRef } from 'react';
import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import PubSub from 'pubsub-js';

import { showError } from '../../utils/notifications';
import { saveSessionCartProductCount } from '../../utils/session';
import callApi from '../../utils/callApi';
import './cartProduct.css';

/**
 * shows a products in the cart
 */
export default function CartProduct({ product, savedForLater, onQtyUpdate }) {
	
	// we keep track of the quantity text field value in this variable via on change event hook
	let quantity = useRef(product.quantity);
	
	// state variable that determines whether we're opaque or not - used when doing cart updates
	const [ updateProgress, setUpdateProgress ] = useState(false);
		
	/**
	 * update cart product quantity event handler
	 */
	const quantityUpdated = async () => {
		
		// do not allow non-numeric quantities
		if (isNaN(parseInt(quantity.current))) {
			showError('Non-numeric quantity. Please enter a number for quantity.');
			return;
		}
		
		// do not allow zero quantity - use remove product instead
		if (parseInt(quantity.current) <= 0) {
			showError('Zero or negative quantity not allowed. Please use remove product instead.');
			return;
		}
		
		// make the api call to update the quantity - show product section opaque until we get a response back from api confirming the quantity update (or error)
		setUpdateProgress(true);
		const apiResponse = await callApi(`shoppingcart/update/${product.item_id}`, { quantity: parseInt(quantity.current) }, 'PUT');
		setUpdateProgress(false);
		
		// if there was an error updating the cart on the server, the error will be shown in a dialog and the api response will be null - do not continue if that happens
		if (!apiResponse) return;
		
		// make a call to the mini cart to update the product count
		const cartProductCount = apiResponse.reduce((total, cartProduct) => total + cartProduct.quantity, 0);
		saveSessionCartProductCount(cartProductCount);
		PubSub.publish('CartUpdate', cartProductCount);
		
		// now call the parent to have it update the cart products in UI
		onQtyUpdate(product.product_id, parseInt(quantity.current));
	};
	
	return (<>
		<div className={`cart-product ${updateProgress ? 'cart-product-update-progress' : ''}`}>
			<div className="cart-product-info">
				<div className="cart-product-image">
					<img src={`/Images/product_images/${product.image}`} alt={product.name} />
				</div>
				<div className="cart-product-text">
					<div className="cart-product-title">{product.name}</div>
					<div className="cart-product-attributes">{product.attributes}</div>
				</div>
			</div>
			<div className="cart-product-price">
				<span className="cart-product-price-label">Price:</span>${product.price}
			</div>
			<div className="cart-product-quantity">
				<span className="cart-product-quantity-label">Qty:</span>
				<TextField defaultValue={product.quantity} type="number" onChange={e => quantity.current = e.target.value} />
			</div>
			<div className="cart-product-subtotal">
				<span className="cart-product-subtotal-label">Subtotal:</span>${parseFloat(product.subtotal).toFixed(2)}
			</div>
			<div className="cart-product-options">
				<Button variant="contained" color="primary" onClick={quantityUpdated}>Update Qty</Button>
				<Button variant="contained" color="primary">Remove</Button>
				<Button variant="contained" color="primary">{savedForLater ? 'Move To Cart' : 'Save For Later'}</Button>
			</div>
		</div>
		<Divider />
	</>);
}