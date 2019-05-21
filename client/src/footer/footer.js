import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

export default function Footer() {
	return (
		<div className="footer">
			<AppBar color="primary" position="static">
				<Toolbar>
					<Typography variant="h6" color="inherit">
						Footer
					</Typography>
				</Toolbar>
			</AppBar>
		</div>
	);
}