import React from 'react';
import { Card, CardContent, Divider } from '@material-ui/core';

import CartProduct from './cartProduct';
import './cartProducts.css';
import LinkButton from '../../shared/linkButton';

/**
 * shows products in the cart or the ones saved for later
 */
export default function CartProducts({ products, savedForLater }) {
	
	return (<>
		{/* if we are displaying products saved for later and there are none, don't show anything at all */}
		{/* for cart products it's different - we show the title and we say cart is empty */}
		{products.length > 0 && !savedForLater && <>
			<Card>
				<CardContent className="cart-products">
					<h2>{savedForLater ? 'Saved For Later' : 'Shopping Cart'}</h2>
					{products.length === 0 && <h4>Your Shopping Cart is empty</h4>}
					{products.length > 0 && <>
						<div className="cart-product-headers">
							<div className="cart-product-header-info">Product</div>
							<div className="cart-product-header-price">Price</div>
							<div className="cart-product-header-quantity">Quantity</div>
							<div className="cart-product-header-subtotal">Subtotal</div>
							<div className="cart-product-header-options">Options</div>
						</div>
						<Divider />
						{products.map((product, index) => (<CartProduct key={index} product={product} savedForLater={savedForLater} />))}
					</>}
					<div className="cart-total">
						Cart Total: <span className="cart-total-price">${products.reduce((total, product) => total + parseFloat(product.subtotal), 0)}</span>
					</div>
					<div className="cart-links">
						<LinkButton variant="contained" color="primary" href="/catalog">Continue Shopping</LinkButton>
						<LinkButton variant="contained" color="primary" href="/checkout">Checkout</LinkButton>
					</div>
				</CardContent>
			</Card>
			<br/>
		</>}
	</>);
}