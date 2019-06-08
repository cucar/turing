import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import TuringList from '../../shared/list/turingList';
import TuringListField from '../../shared/list/turingListField';

import './productReviews.css';
import ProductReview from './productReview';

/**
 * shows product reviews paginated
 */
export default function ProductReviews({ productId }) {
	
	/**
	 * we don't want to show reviews at all if there are none - do it with a callback from the list component
	 */
	const onApiResponseReceived = (response) => {
		if (response.count === 0) document.getElementsByClassName('product-reviews')[ 0 ].style.display = 'none';
	};
	
	return (<>
		<Card className="product-reviews">
			<CardContent>
				<h2>Product Reviews</h2>
				<TuringList endpoint={`products/${productId}/reviews`}
							defaultOrderBy="created_on"
							defaultOrderDirection="desc"
							allowSort={false}
							forcePageSize={5}
							defaultView="list"
							onApiResponseReceived={onApiResponseReceived}
							renderListItem={(row) => <ProductReview review={row}/> }>
					<TuringListField id="customer_name" label="Customer"/>
					<TuringListField id="rating" label="Rating"/>
					<TuringListField id="created_on" label="Review Time"/>
					<TuringListField id="review" label="Review"/>
				</TuringList>
			</CardContent>
		</Card>
	</>);
}