import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-navi';
import Button from '@material-ui/core/Button';

export default function Nav() {
	
	const menuItemStyle = { textDecorationLine: 'none', color: 'white' };
	
	return (
		<div className="header">
			<AppBar color="primary" position="static">
				<Toolbar>
					<Button><Link style={menuItemStyle} href="/">Home</Link></Button>
					<Button><Link style={menuItemStyle} href="/catalog">Catalog</Link></Button>
				</Toolbar>
			</AppBar>
		</div>
	);
}