import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Shipping Page', view: <Shipping /> })
});

function Shipping() {
	return (
		<div className="page">
			<h1>Shipping</h1>
			<LinkButton variant="contained" color="primary" href="/review">Review</LinkButton>
		</div>
	);
}