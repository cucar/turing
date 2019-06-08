import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import PubSub from 'pubsub-js';

import TuringForm, { Validators } from '../../shared/form/turingForm';
import TuringRatingField from '../../shared/form/turingRatingField';
import TuringTextField from '../../shared/form/turingTextField';
import TuringFormSubmitButton from '../../shared/form/turingFormSubmitButton';
import { showSuccess } from '../../utils/notifications';

/**
 * shows the form to post review for a product
 */
export default function PostReview({ productId }) {
	
	/**
	 * returns the api parameters to be sent for adding review - a little transformation is needed from the field values
	 */
	const getAddReviewParams = (fieldValues) => {
		return {
			product_id: productId,
			rating: fieldValues.rating,
			review: fieldValues.review
		};
	};
	
	/**
	 * event handler after the review is posted - update review list by posting notification via pub-sub
	 */
	const reviewPosted = () => {
		showSuccess('Review was posted successfully.');
		PubSub.publish('PostReview', true);
		window.location.hash = 'product-reviews'; // scroll to the beginning of product reviews list so user can see the new review up top
	};
	
	return (
		<Card>
			<CardContent>
				<h2>Add Review</h2>
				<TuringForm endpoint={`products/${productId}/reviews`} method="POST" authenticated={true} getApiParams={getAddReviewParams} onApiResponseReceived={reviewPosted}>
					<TuringRatingField key="rating" label="Rating" validators={[ Validators.required ]} />
					<TuringTextField key="review" label="Review" multiLine={true} />
					<br/>
					<TuringFormSubmitButton key="postReview" label="Submit" />
				</TuringForm>
			</CardContent>
		</Card>
	);
}