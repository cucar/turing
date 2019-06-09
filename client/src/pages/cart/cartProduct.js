import React from 'react';
import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';

import './cartProduct.css';

/**
 * shows a products in the cart
 */
export default function CartProduct({ product, savedForLater }) {
	
	return (<>
		<div className="cart-product">
			<div className="cart-product-info">
				<div className="cart-product-image">
					<img src={`/Images/product_images/${product.image}`} alt={product.name} />
				</div>
				<div className="cart-product-text">
					<div className="cart-product-title">{product.name}</div>
					<div className="cart-product-attributes">{product.attributes}</div>
				</div>
			</div>
			<div className="cart-product-price"><span className="cart-product-price-label">Price:</span>${product.price}</div>
			<div className="cart-product-quantity"><span className="cart-product-quantity-label">Qty:</span><TextField defaultValue={product.quantity} type="number" /></div>
			<div className="cart-product-subtotal"><span className="cart-product-subtotal-label">Subtotal:</span>${product.subtotal}</div>
			<div className="cart-product-options">
				<Button variant="contained" color="primary">Update Qty</Button>
				<Button variant="contained" color="primary">Remove</Button>
				<Button variant="contained" color="primary">{savedForLater ? 'Move To Cart' : 'Save For Later'}</Button>
			</div>
		</div>
		<Divider />
	</>);
}