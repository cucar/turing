import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Card, CardContent } from '@material-ui/core';

import { Api } from '../../shared/api';

/**
 * shows category header
 */
export default function CategoryHeader({ categoryId }) {
	return (<>
		<Card>
			<CardContent>
				<Api endpoint={`categories/${categoryId}`} render={category => (<>
					<Typography variant="h4">{category.name}</Typography>
					<p>{category.description}</p>
				</>)}/>
			</CardContent>
		</Card>
		<br/>
	</>);
}