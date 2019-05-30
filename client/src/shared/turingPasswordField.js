import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField/TextField';

/**
 * turing form field component
 */
function TuringPasswordField({ id, type, label, validators, value, error, onChange }) {
	return (
		<TextField key={id + 'input'}
				   style={{ width: '100%' }}
				   label={label}
				   error={!!error}
				   helperText={error}
				   type="password"
				   value={value}
				   onChange={onChange} />
	);
}

TuringPasswordField.propTypes = {
	id: PropTypes.string, // will be populated from parent
	label: PropTypes.string.isRequired,
	validators: PropTypes.array,
	value: PropTypes.string, // will be populated from parent
	error: PropTypes.string, // will be populated from parent
	onChange: PropTypes.any // will be populated from parent
};

export default TuringPasswordField;