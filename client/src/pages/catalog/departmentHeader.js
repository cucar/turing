import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { Api } from '../../shared/api';

/**
 * shows department header
 */
export default function DepartmentHeader({ departmentId }) {
	return (<>
		<Api endpoint={`departments/${departmentId}`} render={department =>
			<Card>
				<CardContent>
					<Typography variant="h4">{department.name}</Typography>
					<p>{department.description}</p>
				</CardContent>
			</Card>
		}/>
		<br/>
	</>);
}