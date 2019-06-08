import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@material-ui/core';
import TuringList from '../../shared/list/turingList';
import TuringListField from '../../shared/list/turingListField';
import PubSub from 'pubsub-js';

import './productReviews.css';
import ProductReview from './productReview';

/**
 * we don't want to show reviews at all if there are none - do it with a callback from the list component
 * this is setup as a global function to avoid getting a new function every time we render - since it's passed as props it causes render on the list class
 * we could use callback hook but it doesn't really depend on any of the props and it gives warnings
 */
const onApiResponseReceived = (response) => {
	let reviewListElement = document.getElementById('product-reviews');
	if (!reviewListElement) return; // if we're in the process of getting mounted or un-mounted, nothing we can do
	reviewListElement.style.display = (response.count === 0 ? 'none' : 'block');
};

/**
 * shows product reviews paginated
 */
export default function ProductReviews({ productId }) {
	
	let [ refreshCounter, setRefreshCounter ] = useState(0);
	const forceRefresh = () => setRefreshCounter(++refreshCounter);
	
	/**
	 * subscribe to the post review queue - this is going to be populated by the post review component in the same page as this one
	 */
	useEffect(() => {
		PubSub.subscribe('PostReview', () => forceRefresh());
		return () => PubSub.unsubscribe('PostReview');
	});
	
	return (<>
		<Card className="product-reviews" id="product-reviews">
			<CardContent>
				<h2>Product Reviews</h2>
				<TuringList endpoint={`products/${productId}/reviews`}
							defaultOrderBy="created_on"
							defaultOrderDirection="desc"
							allowSort={false}
							forcePageSize={5}
							defaultView="list"
							refreshCounter={refreshCounter}
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