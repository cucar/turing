import React from 'react';
import PropTypes from 'prop-types';

/**
 * this component is used to pass the list fields to the list component - it does not have a display on its own - it's just a data container
 */
function TuringListField() {

	// no display - this component is only used for storing data so that the parent list component can read what to display
	return (<></>);
}

TuringListField.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired
};

export default TuringListField;