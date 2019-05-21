import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Review Page', view: <Review /> })
});

function Review() {
	return (
		<div className="page">
			<h1>Review</h1>
			<LinkButton variant="contained" color="primary" href="/payment">Payment</LinkButton>
		</div>
	);
}