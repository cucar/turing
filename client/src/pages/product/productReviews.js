import React from 'react';
import { Card, CardContent } from '@material-ui/core';

/**
 * shows product reviews paginated
 */
export default function ProductReviews({ productId }) {
	return (
		<Card>
			<CardContent>
				<h1>Product Reviews for {productId}</h1>
			</CardContent>
		</Card>
	);
}