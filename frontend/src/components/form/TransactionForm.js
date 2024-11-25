import React from 'react';
import { IonButton, IonDatetime, IonModal, IonDatetimeButton } from '@ionic/react';
import TiptapEditor from './TiptapEditor';
import TransactionTypeSelect from './TransactionTypeSelect';
import BankAccountSelect from './BankAccountSelect';
import TextInput from './TextInput';
import CurrencyInput from './CurrencyInput';
import FileUpload from './FileUpload';

const TransactionForm = ({
  transactionType,
  title,
  amount,
  description,
  selectedBankAccount,
  selectedFiles,
  existingFiles,
  bankAccounts,
  loading,
  date,
  onSubmit,
  onTransactionTypeChange,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onBankAccountChange,
  onFileSelect,
  onFileRemove,
  onExistingFileRemove,
  onDateChange,
  submitButtonText,
}) => {
  const handleDescriptionChange = (newContent) => {
    onDescriptionChange(newContent);
  };

  const getCurrentDescription = () => {
    return description || [];
  };

  return (
    <form onSubmit={onSubmit} className="form-container">
      <div className="form-container">
        {/* Transaction Type */}
        <TransactionTypeSelect
          value={transactionType}
          onChange={onTransactionTypeChange}
        />

        {/* Bank Account */}
        <BankAccountSelect
          value={selectedBankAccount}
          onChange={onBankAccountChange}
          bankAccounts={bankAccounts}
        />

        {/* Title */}
        <TextInput
          id="title"
          label="Title"
          value={title}
          onChange={onTitleChange}
          required
        />

        {/* Amount */}
        <CurrencyInput
          id="amount"
          label="Amount"
          value={amount}
          onChange={onAmountChange}
          required
        />

        {/* Date */}
        <div className="form-group">
          <div style={{ display: 'none' }}>
            <IonDatetimeButton 
              datetime="transaction-date" 
              className="custom-datetime-button"
              id="hidden-datetime-btn"
            />
          </div>
          <button
            type="button"
            className="custom-date-trigger"
            onClick={() => {
              const hiddenBtn = document.querySelector('#hidden-datetime-btn');
              hiddenBtn?.shadowRoot?.querySelector('button')?.click();
            }}
          >
            {date ? new Date(date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Select Date'}
          </button>
          <IonModal keepContentsMounted={true}>
            <IonDatetime 
              id="transaction-date"
              value={date}
              onIonChange={e => onDateChange(e.detail.value)}
              presentation="date"
              showDefaultButtons={true}
              firstDayOfWeek={1}
              className="custom-datetime"
              locale="id-ID"
              formatOptions={{
                date: {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }
              }}
            />
          </IonModal>
          <label htmlFor="transaction-date">Date</label>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>
          <TiptapEditor 
            content={getCurrentDescription()}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* File Upload */}
        <FileUpload
          files={selectedFiles}
          onFileSelect={onFileSelect}
          onFileRemove={onFileRemove}
          existingFiles={existingFiles}
          onExistingFileRemove={onExistingFileRemove}
        />

        <IonButton
          expand="block"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Processing...' : submitButtonText}
        </IonButton>
      </div>
    </form>
  );
};

export default TransactionForm;
