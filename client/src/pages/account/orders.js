import React from 'react';

import LinkButton from '../../shared/linkButton';
import TuringList from '../../shared/turingList';
import TuringListField from '../../shared/turingListField';

/**
 * orders list screen
 */
export default function Orders() {
	return (<>
		<h1>My Orders</h1>
		
		<TuringList endpoint="orders/inCustomer" defaultOrderBy="order_id">
			<TuringListField id="order_id" label="Order ID" />
			<TuringListField id="total_amount" label="Amount" />
			<TuringListField id="created_on" label="Order Date" />
			<TuringListField id="auth_code" label="Auth Code" />
			<TuringListField id="reference" label="Auth Reference" />
			<TuringListField id="shipping_type" label="Shipping" />
			<TuringListField id="tax_type" label="Tax" />
		</TuringList>
		
		<br/>
		
		<LinkButton href="/account">Get Back to My Account</LinkButton>
	</>);
}