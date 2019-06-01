import React from 'react';

import LinkButton from '../../shared/linkButton';
import TuringList from '../../shared/turingList';

/**
 * orders list screen
 */
export default function Orders() {
	
	// this data should be extracted from children of the list component
	const listFields = [
		{ id: 'order_id', label: 'Order ID' },
		{ id: 'total_amount', label: 'Amount' },
		{ id: 'created_on', label: 'Order Date' },
		{ id: 'auth_code', label: 'Auth Code' },
		{ id: 'reference', label: 'Auth Reference' },
		{ id: 'shipping_type', label: 'Shipping' },
		{ id: 'tax_type', label: 'Tax' }
	];
	
	return (<>
		<h1>My Orders</h1>
		
		<TuringList endpoint="orders/inCustomer" defaultOrderBy="order_id" listFields={listFields}>
		</TuringList>
		
		<br/>
		
		<LinkButton href="/account">Get Back to My Account</LinkButton>
	</>);
}