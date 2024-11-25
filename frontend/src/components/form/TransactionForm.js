import React from 'react';
import { IonButton } from '@ionic/react';
import TransactionTypeSelect from './TransactionTypeSelect';
import BankAccountSelect from './BankAccountSelect';
import TextInput from './TextInput';
import CurrencyInput from './CurrencyInput';
import FileUpload from './FileUpload';

const TransactionForm = ({
  // Form values
  transactionType,
  title,
  amount,
  description,
  selectedBankAccount,
  selectedFiles,
  existingFiles,
  bankAccounts,
  loading,
  
  // Event handlers
  onSubmit,
  onTransactionTypeChange,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onBankAccountChange,
  onFileSelect,
  onFileRemove,
  onExistingFileRemove,
  
  // Button text
  submitButtonText
}) => {
  
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

        {/* Description */}
        <TextInput
          id="description"
          label="Description"
          value={description}
          onChange={onDescriptionChange}
          multiline
        />

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
