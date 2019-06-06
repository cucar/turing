import React from 'react';
import { Card, CardContent } from '@material-ui/core';

/**
 * shows the form to post review for a product
 */
export default function PostReview({ productId }) {
	return (
		<Card>
			<CardContent>
				<h1>Posting Review for Product ID {productId}</h1>
			</CardContent>
		</Card>
	);
}