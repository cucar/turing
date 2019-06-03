import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': route(req => ({ title: 'Turing Catalog Page', view: <Catalog filters={req.params} /> }))
});

/**
 * shows the products in catalog
 */
function Catalog({ filters }) {
	return (<>
		<h1>Catalog</h1>
		{JSON.stringify(filters)}
		<LinkButton variant="contained" color="primary" href="/product">Product</LinkButton>
	</>);
}