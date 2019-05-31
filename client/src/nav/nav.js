import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LinkButton from '../shared/linkButton';

export default function Nav() {
	
	return (
		<div className="header">
			<AppBar color="primary" position="static">
				<Toolbar>
					<LinkButton variant="text" href="/">Home</LinkButton>
					<LinkButton variant="text" href="/catalog">Catalog</LinkButton>
					<LinkButton variant="text" href="/cart">Cart</LinkButton>
					<LinkButton variant="text" href="/account">My Account</LinkButton>
				</Toolbar>
			</AppBar>
		</div>
	);
}