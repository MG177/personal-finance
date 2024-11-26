import React from 'react';
import Select, { components } from 'react-select';

const CategorySelect = ({ value, onChange, categories, required = true }) => {
  // Format categories for react-select
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
    iconUrl: category.iconUrl ? `${process.env.REACT_APP_STRAPI_URL}${category.iconUrl}` : null,
    category: category
  }));

  console.log(categories);
  

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
      color: '#000000 !important',
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
        {props.data.iconUrl ? (
          <img 
            src={props.data.iconUrl} 
            alt="" 
            style={{ width: 20, height: 20, objectFit: 'contain' }} 
          />
        ) : (
          <img 
            src="/no-image-available-icon.jpg"
            alt=""
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        )}
        {children}
      </components.Option>
    ),
    SingleValue: ({ children, ...props }) => (
      <components.SingleValue {...props}>
        {props.data.iconUrl ? (
          <img 
            src={props.data.iconUrl} 
            alt="" 
            style={{ width: 20, height: 20, objectFit: 'contain' }} 
          />
        ) : (
          <img 
            src="/no-image-available-icon.jpg"
            alt=""
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        )}
        {children}
      </components.SingleValue>
    )
  };

  return (
    <div className="form-group">
      <Select
        id="category"
        value={categoryOptions.find(option => option.value === value)}
        onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : null)}
        options={categoryOptions}
        styles={customStyles}
        components={customComponents}
        isClearable
        placeholder="Select category..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
      <label htmlFor="category">Category</label>
    </div>
  );
};

export default CategorySelect;
