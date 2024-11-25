import React from 'react';

const TextInput = ({ 
  id, 
  label, 
  value, 
  onChange, 
  required = false, 
  type = 'text',
  multiline = false,
  rows = 3
}) => {
  return (
    <div className="form-group">
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default TextInput;
