import React, { useCallback } from 'react';
import { Card, CardContent, Divider } from '@material-ui/core';

import { loggedIn } from '../../utils/session';
import LinkButton from '../../shared/linkButton';
import CartProduct from './cartProduct';
import './cartProducts.css';

/**
 * shows products in the cart or the ones saved for later
 */
export default function CartProducts({ products, savedForLater, onQtyUpdate, onRemove, onSaveForLater, onMoveToCart }) {
	
	/**
	 * cart update event handlers - need to use callback here to not cause re-render of children since it's passed as a prop
	 * bubble the events up to the parent so that the products state can be updated globally
	 */
	const productQuantityUpdated = useCallback((itemId, args) => onQtyUpdate(itemId, args), [ onQtyUpdate ]);
	const productRemoved = useCallback((itemId, args) => onRemove(itemId, args), [ onRemove ]);
	const productSavedForLater = useCallback((itemId, args) => onSaveForLater(itemId, args), [ onSaveForLater ]);
	const productMovedToCart = useCallback((itemId, args) => onMoveToCart(itemId, args), [ onMoveToCart ]);
	
	return (<>
		{/* if we are displaying products saved for later and there are none, don't show anything at all */}
		{/* for cart products it's different - we show the title and we say cart is empty */}
		{(!savedForLater || products.length > 0) && <>
			<Card>
				<CardContent className="cart-products">
					<h2>{savedForLater ? 'Saved For Later' : 'Shopping Cart'}</h2>
					{products.length === 0 && <div>Your Shopping Cart is empty.</div>}
					{products.length > 0 && <>
						<div className="cart-product-headers">
							<div className="cart-product-header-info">Product</div>
							<div className="cart-product-header-price">Price</div>
							<div className="cart-product-header-quantity">Quantity</div>
							<div className="cart-product-header-subtotal">Subtotal</div>
							<div className="cart-product-header-options">Options</div>
						</div>
						<Divider />
						{products.map((product, index) => (
							<CartProduct
								key={index}
								product={product}
								savedForLater={savedForLater}
								onQtyUpdate={productQuantityUpdated}
								onRemove={productRemoved}
								onSaveForLater={productSavedForLater}
								onMoveToCart={productMovedToCart}
							/>
						))}
					</>}
					{!savedForLater && products.length > 0 && <div className="cart-total">
						Cart Total:&nbsp;
						<span className="cart-total-price">
							${products.reduce((total, product) => total + parseFloat(product.subtotal), 0).toFixed(2)}
						</span>
					</div>}
					{!savedForLater && <div className="cart-links">
						<LinkButton variant="contained" color="primary" href="/catalog">Continue Shopping</LinkButton>
						{products.length > 0 && <LinkButton variant="contained" color="primary" href="/checkout">
							{loggedIn() ? 'Checkout' : 'Sign In to Checkout'}
						</LinkButton>}
					</div>}
				</CardContent>
			</Card>
			<br/>
		</>}
	</>);
}