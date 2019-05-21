import React from 'react';
import { mount, route } from 'navi';

export default mount({
	'/': route({ title: 'Turing Order Page', view: <Order /> })
});

function Order() {
	return (
		<div className="page">
			<h1>Order</h1>
		</div>
	);
}