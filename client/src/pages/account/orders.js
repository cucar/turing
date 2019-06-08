import React from 'react';
import { Card, CardContent, CardActions } from '@material-ui/core';

import LinkButton from '../../shared/linkButton';
import TuringList from '../../shared/list/turingList';
import TuringListField from '../../shared/list/turingListField';

/**
 * orders list screen
 */
export default function Orders() {
	return (
		<Card>
			<CardContent>
				<h1>My Orders</h1>
				
				<TuringList endpoint="orders/inCustomer" defaultOrderBy="order_id" detailRoute={row => `/account/orders/${row.order_id}`}>
					<TuringListField id="order_id" label="Order ID" />
					<TuringListField id="total_amount" label="Amount" />
					<TuringListField id="created_on" label="Order Date" />
					<TuringListField id="auth_code" label="Auth Code" />
					<TuringListField id="reference" label="Auth Reference" />
					<TuringListField id="shipping_type" label="Shipping" />
					<TuringListField id="tax_type" label="Tax" />
				</TuringList>
			</CardContent>
			<CardActions>
				<LinkButton href="/account">Back to My Account</LinkButton>
			</CardActions>
		</Card>
	);
}