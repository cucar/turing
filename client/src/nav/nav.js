import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LinkButton from '../shared/linkButton';

export default function Nav() {
	
	return (
		<div className="header">
			<AppBar color="primary" position="static">
				<Toolbar>
					<LinkButton href="/">Home</LinkButton>
					<LinkButton href="/catalog">Catalog</LinkButton>
					<LinkButton href="/cart">Cart</LinkButton>
					<LinkButton href="/account">My Account</LinkButton>
				</Toolbar>
			</AppBar>
		</div>
	);
}