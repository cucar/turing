import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Catalog Page', view: <Catalog /> })
});

/**
 * shows the products in catalog
 */
function Catalog() {
	return (<>
		<h1>Catalog</h1>
		<LinkButton variant="contained" color="primary" href="/product">Product</LinkButton>
	</>);
}