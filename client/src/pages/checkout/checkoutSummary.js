import React, { useState, useEffect } from 'react';
import { Select, MenuItem } from '@material-ui/core';

import LinkButton from '../../shared/linkButton';
import './checkoutSummary.css';

/**
 * shows the checkout items and allows selection of shipping method
 */
export default function CheckoutSummary({ checkoutData, onShippingMethodChange }) {
	
	/**
	 * returns the shipping method cost from shipping method id
	 */
	const getShippingMethodCost = (inputShippingMethodId) => {
		return parseFloat(checkoutData.shipping_methods.find(shippingMethod => shippingMethod.shipping_id === inputShippingMethodId).shipping_cost);
	};
	
	/**
	 * event handler called when shipping method is changed
	 */
	const shippingMethodChanged = (event) => {
		let newShippingMethodId = event.target.value;
		let newShippingTotal = getShippingMethodCost(event.target.value);
		setShippingMethodId(newShippingMethodId);
		setShippingTotal(newShippingTotal);
		onShippingMethodChange(newShippingMethodId, cartTotal, newShippingTotal, taxTotal)
	};
	
	// state variables - shipping method id and the totals including shipping and tax
	const initialCartTotal = checkoutData.products.reduce((total, product) => total + parseFloat(product.subtotal), 0);
	const initialTaxTotal = checkoutData.tax_amount;
	const initialShippingMethodId = (checkoutData.shipping_methods.length === 0 ? 0 : checkoutData.shipping_methods[0].shipping_id);
	const initialShippingTotal = (checkoutData.shipping_methods.length === 0 ? 0 : parseFloat(checkoutData.shipping_methods[0].shipping_cost));
	const [ cartTotal ] = useState(initialCartTotal);
	const [ shippingMethodId, setShippingMethodId ] = useState(initialShippingMethodId);
	const [ shippingTotal, setShippingTotal ] = useState(initialShippingTotal);
	const [ taxTotal ] = useState(initialTaxTotal);

	/**
	 * initial render will determine the shipping method if available and call parent to update UI
	 */
	useEffect(() => {
		onShippingMethodChange(initialShippingMethodId, initialCartTotal, initialShippingTotal, initialTaxTotal);
	}, [ onShippingMethodChange, initialShippingMethodId, initialCartTotal, initialShippingTotal, initialTaxTotal ]);
	
	return (<>
		{/* no records found in the api data - show that */}
		{checkoutData.products.length === 0 && <div className="checkout-no-products">Shopping cart is empty. Please add products to check out.</div>}
		
		{/* we have products in cart - show summary */}
		{checkoutData.products.length > 0 &&
		<div className="checkout-table">
			
			<div className="checkout-headers">
				<div className="checkout-header-item">Item</div>
				<div className="checkout-header-price">Price</div>
				<div className="checkout-header-quantity">Quantity</div>
				<div className="checkout-header-subtotal">Subtotal</div>
			</div>
			
			{checkoutData.products.map(product =>
				<div key={product.item_id} className="checkout-product">
					<div className="checkout-product-info">{product.name} ({product.attributes})</div>
					<div className="checkout-product-price">${product.price}</div>
					<div className="checkout-product-quantity">{product.quantity}</div>
					<div className="checkout-product-subtotal">${product.subtotal}</div>
				</div>
			)}
			
			<div className="checkout-cart-total-row">
				<div className="checkout-cart-total-label">Cart Total</div>
				<div className="checkout-cart-total-amount">${cartTotal.toFixed(2)}</div>
			</div>
			<div className="checkout-shipping-method-row">
				
				<div className="checkout-shipping-amount-label">Shipping Amount</div>

				{/* when there are no shipping methods, there is something wrong - we can't continue - show link to update shipping address & region */}
				{checkoutData.shipping_methods.length === 0 && <div className="checkout-no-shipping-methods">
					No shipping methods. <br/>
					Need address and shipping region.<br/>
					<LinkButton className="update-address-button" href="/account/update/address">Update Address On File</LinkButton>
				</div>}
				
				{checkoutData.shipping_methods.length > 0 && <div className="checkout-shipping-methods">
					<Select value={shippingMethodId} onChange={shippingMethodChanged} inputProps={{ name: 'checkout-shipping-method', id: 'checkout-shipping-method' }}>
						{checkoutData.shipping_methods.map(shippingMethod => <MenuItem key={shippingMethod.shipping_id} value={shippingMethod.shipping_id}>{shippingMethod.shipping_type}</MenuItem>)}
					</Select>
				</div>}
				
				<div className="checkout-shipping-amount">${shippingTotal.toFixed(2)}</div>
			</div>
			
			<div className="checkout-tax-row">
				<div className="checkout-tax-label">Tax Amount (estimated)</div>
				<div className="checkout-tax-amount">${taxTotal.toFixed(2)}</div>
			</div>
			
			<div className="checkout-total-tow">
				<div className="checkout-total-label">Total Amount</div>
				<div className="checkout-total-amount">${(cartTotal + shippingTotal + taxTotal).toFixed(2)}</div>
			</div>
		
		</div>}
	</>);
}