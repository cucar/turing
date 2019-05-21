import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Catalog Page', view: <Catalog /> })
});

function Catalog() {
	return (
		<div className="page">
			<h1>Catalog</h1>
			<LinkButton variant="contained" color="primary" href="/product">Product</LinkButton>
		</div>
	);
}