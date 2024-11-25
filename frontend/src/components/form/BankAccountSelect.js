import React from 'react';
import Select, { components } from 'react-select';

const BankAccountSelect = ({ value, onChange, bankAccounts, required = true }) => {
  // Format bank accounts for react-select
  const bankAccountOptions = bankAccounts.map(account => ({
    value: account.id,
    label: `${account.accountName} (${account.currency})`,
    iconUrl: account.iconUrl,
    account: account
  }));

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: 40,
      backgroundColor: 'var(--ion-item-background)',
      borderColor: 'var(--ion-border-color)',
      '&:hover': {
        borderColor: 'var(--ion-color-primary)'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#acc5eb !important' : 'var(--ion-item-background)',
      color: '#000000 !important', // Force black color always
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#acc5eb !important' : '#f5f5f5 !important'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--ion-item-background)',
      border: '2px solid var(--ion-border-color)',
    })
  };

  // Custom components for react-select
  const customComponents = {
    Option: ({ children, ...props }) => (
      <components.Option {...props}>
        {props.data.iconUrl && (
          <img
            src={`${process.env.REACT_APP_STRAPI_URL}${props.data.iconUrl}`}
            alt=""
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        )}
        {children}
      </components.Option>
    ),
    SingleValue: ({ children, ...props }) => (
      <components.SingleValue {...props}>
        {props.data.iconUrl && (
          <img
            src={`${process.env.REACT_APP_STRAPI_URL}${props.data.iconUrl}`}
            alt=""
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        )}
        {children}
      </components.SingleValue>
    ),
  };

  return (
    <div className="form-group">
      <Select
        id="bank-account"
        value={bankAccountOptions.find(option => option.value === value)}
        onChange={(option) => onChange(option.value)}
        options={bankAccountOptions}
        styles={customStyles}
        components={customComponents}
        placeholder="Select Bank Account"
        className="react-select-container"
        classNamePrefix="react-select"
        isSearchable={false}
        required={required}
      />
      <label htmlFor="bank-account">Bank Account</label>
    </div>
  );
};

export default BankAccountSelect;
