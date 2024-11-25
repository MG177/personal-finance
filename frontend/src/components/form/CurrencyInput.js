import React from 'react';

const CurrencyInput = ({ id, label, value, onChange, required }) => {
  const formatToIDR = (value) => {
    // Remove non-digit characters
    const number = value.replace(/\D/g, '');
    
    // Convert to number and format with thousand separator
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);

    return formatted;
  };

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    // Pass the raw number to parent but display formatted
    onChange(rawValue);
  };

  return (
    <div className="form-group">
      <input
        type="text"
        id={id}
        value={formatToIDR(value)}
        onChange={handleChange}
        required={required}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default CurrencyInput;
