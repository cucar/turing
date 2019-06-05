import React from 'react';
import Typography from '@material-ui/core/Typography';

import { Api } from '../../shared/api';

/**
 * shows category header
 */
export default function CategoryHeader({ categoryId }) {
	return (<>
		<Api endpoint={`categories/${categoryId}`} render={category => (<>
			<Typography variant="h4">{category.name}</Typography>
			<p>{category.description}</p>
		</>)}/>
	</>);
}