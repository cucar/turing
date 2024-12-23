import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField/TextField';

/**
 * turing form field component
 */
function TuringTextField({ id, label, validators, multiLine = false, value, error, onChange, onEnter }) {
	return (
		<TextField key={id + 'input'}
				   style={{ width: '100%' }}
				   label={label}
				   value={value}
				   multiline={multiLine}
				   error={!!error}
				   helperText={error}
				   onChange={onChange}
				   onKeyPress={async (ev) => { if (!multiLine && ev.key === 'Enter') { ev.preventDefault(); await onEnter(); } }}
		/>
	);
}

TuringTextField.propTypes = {
	id: PropTypes.string, // will be populated from parent
	label: PropTypes.string.isRequired,
	multiLine: PropTypes.bool,
	validators: PropTypes.array,
	value: PropTypes.string, // will be populated from parent
	error: PropTypes.string, // will be populated from parent
	onChange: PropTypes.any, // will be populated from parent
	onEnter: PropTypes.any // will be populated from parent
};

export default TuringTextField;