import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

export default function Header() {

	return (
		<div className="header">
			<Toolbar>
				<Typography variant="h6" color="inherit">
					Sign In or Register
				</Typography>
			</Toolbar>
		</div>
	);
}