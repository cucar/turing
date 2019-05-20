import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

function Header() {

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

export default withStyles({ header: { flexGrow: 1 } })(Header);