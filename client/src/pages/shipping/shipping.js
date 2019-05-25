import React from 'react';
import { mount, route } from 'navi';
import LinkButton from '../../shared/linkButton';

export default mount({
	'/': route({ title: 'Turing Shipping Page', view: <Shipping /> })
});

/**
 * shows the shipping information as checkout first step
 */
function Shipping() {
	return (<>
		<h1>Shipping</h1>
		<LinkButton variant="contained" color="primary" href="/review">Review</LinkButton>
	</>);
}