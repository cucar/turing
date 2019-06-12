import React from 'react';
import { Link } from 'react-navi';
import Button from '@material-ui/core/Button';

export default function LinkButton(props) {
	
	const linkStyle = { textDecoration: 'none', color: 'white' };
	
	return (
		<Button variant={props.variant || 'contained'} color={props.color || 'primary'}>
			<Link style={linkStyle} href={props.href}>{props.children}</Link>
		</Button>
	);
}