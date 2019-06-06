import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Card, CardContent } from '@material-ui/core';

import { Api } from '../../shared/api';

/**
 * shows department header
 */
export default function DepartmentHeader({ departmentId }) {
	return (<>
		<Card>
			<CardContent>
				<Api endpoint={`departments/${departmentId}`} render={department => (<>
					<Typography variant="h4">{department.name}</Typography>
					<p>{department.description}</p>
				</>)}/>
			</CardContent>
		</Card>
		<br/>
	</>);
}