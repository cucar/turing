import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-navi';

import './header.css';

export default function Header() {

	return (
		<Toolbar>
			<div className="header">
				<div className="login-signup">
					<Link href="/account/login">Sign In</Link> or <Link href="/account/register">Register</Link>
				</div>
				<div className="logout">
					<Link href="/account/logout">Logout</Link>
				</div>
			</div>
		</Toolbar>
	);
}