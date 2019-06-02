import React from 'react';
import { Card, CardContent, CardActions } from '@material-ui/core';

import LinkButton from '../../shared/linkButton';
import TuringList from '../../shared/turingList';
import TuringListField from '../../shared/turingListField';

/**
 * reviews list screen
 */
export default function Reviews() {
	return (
		<Card>
			<CardContent>
				<h1>My Reviews</h1>
				
				<TuringList endpoint="products/reviews/inCustomer" defaultOrderBy="created_on">
					<TuringListField id="product_name" label="Product" />
					<TuringListField id="created_on" label="Review Date" />
					<TuringListField id="rating" label="Rating" />
					<TuringListField id="review" label="Review" />
				</TuringList>
			</CardContent>
			<CardActions>
				<LinkButton href="/account">Back to My Account</LinkButton>
			</CardActions>
		</Card>
	);
}