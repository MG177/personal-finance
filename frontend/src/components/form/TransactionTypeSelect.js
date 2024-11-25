import React from 'react';

const TransactionTypeSelect = ({ value, onChange, required = true }) => {
  return (
    <div className="form-group">
      <select
        id="transaction-type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="custom-select"
        required={required}
      >
        <option value="" disabled>Select Type</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <label htmlFor="transaction-type">Transaction Type</label>
    </div>
  );
};

export default TransactionTypeSelect;
