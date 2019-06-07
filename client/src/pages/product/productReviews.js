import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import TuringList from '../../shared/turingList';
import TuringListField from '../../shared/turingListField';

import ProductReview from './productReview';

/**
 * shows product reviews paginated
 */
export default function ProductReviews({ productId }) {
	return (
		<Card>
			<CardContent>
				<h2>Product Reviews</h2>
				<TuringList endpoint={`products/${productId}/reviews`}
							defaultOrderBy="created_on"
							defaultOrderDirection="desc"
							allowSort={false}
							forcePageSize={5}
							defaultView="list"
							renderListItem={(row) => <ProductReview review={row}/> }>
					<TuringListField id="customer_name" label="Customer"/>
					<TuringListField id="rating" label="Rating"/>
					<TuringListField id="created_on" label="Review Time"/>
					<TuringListField id="review" label="Review"/>
				</TuringList>
			</CardContent>
		</Card>
	);
}