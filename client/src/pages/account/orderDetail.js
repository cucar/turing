import React from 'react';
import { Card, CardContent, CardActions, TextField } from '@material-ui/core';

import LinkButton from '../../shared/linkButton';
import { Api } from '../../shared/api';
import TuringListField from '../../shared/list/turingListField';
import TuringList from '../../shared/list/turingList';

/**
 * order detail screen
 */
export default function OrderDetail({ orderId }) {

	return (
		<Card>
			<CardContent>
				<h1>Order ID {orderId}</h1>
				
				<Api endpoint={`orders/shortDetail/${orderId}`} render={order => (
					<div style={{ display: 'flex', flexDirection: 'row' }}>
						<div style={{ width: '50%' }}>
							<TextField label="Order Amount" value={order.total_amount} InputProps={{ readOnly: true }}/>
							<TextField label="Auth Code" value={order.auth_code} InputProps={{ readOnly: true }}/>
							<TextField label="Shipping" value={order.shipping_type} InputProps={{ readOnly: true }}/>
						</div>
						<div style={{ width: '50%' }}>
							<TextField label="Order Date" value={order.created_on} InputProps={{ readOnly: true }}/>
							<TextField label="Auth Reference" value={order.reference} InputProps={{ readOnly: true }}/>
							<TextField label="Tax" value={order.tax_type} InputProps={{ readOnly: true }}/>
						</div>
					</div>
				)} />
				
				<br/>
				
				<TuringList endpoint={`orders/${orderId}`} defaultOrderBy="item_id">
					<TuringListField id="product_name" label="Product"/>
					<TuringListField id="attributes" label="Attributes"/>
					<TuringListField id="quantity" label="Quantity"/>
					<TuringListField id="unit_cost" label="Unit Price"/>
					<TuringListField id="subtotal" label="Subtotal"/>
				</TuringList>
				
			</CardContent>
			<CardActions>
				<LinkButton href="/account/orders">Back to Orders List</LinkButton>
			</CardActions>
		</Card>
	);
}