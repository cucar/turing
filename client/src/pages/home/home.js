import React from 'react';

import LinkButton from '../../shared/linkButton';

/**
 * shows home page
 */
export default function Home() {

	return (<>
		<h1>Home</h1>

		<p>Welcome. This is a test store currently in development. Implemented for Turing Challenge. Feel free to test it out. You can use a test card in checkout page.</p>
		<br/>
		<LinkButton href="/catalog">View Products</LinkButton>
	</>);
}