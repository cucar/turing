import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-navi';

export default function Header() {

	return (
		<div className="header">
			<Toolbar>
				<Typography variant="h6" color="inherit">
					<Link href="/account/login">Sign In</Link> or <Link href="/account/register">Register</Link>
				</Typography>
			</Toolbar>
		</div>
	);
}