import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonLoading,
  useIonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import strapiAPI from '../api/strapi';
import TransactionForm from '../components/form/TransactionForm';
import '../App.css';

const CreateTransaction = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [transactionType, setTransactionType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [date, setDate] = useState(new Date().toISOString());

  // Load bank accounts
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        const response = await strapiAPI.get('/bank-accounts', {
          params: {
            populate: 'icon'
          }
        });
        const formattedAccounts = response.data.data.map(account => ({
          id: account.id,
          documentId: account.documentId,
          accountName: account.account_name,
          bankName: account.bank_name,
          currency: account.currency,
          iconUrl: account.icon?.url
        }));
        setBankAccounts(formattedAccounts);
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        present({
          message: 'Failed to load bank accounts',
          duration: 3000,
          color: 'danger',
        });
      }
    };
    
    const getDefaulkBankAccount = async () => {
      try {
        const response = await strapiAPI.get('/default-bank-account?populate=*');
        const defaultAccount = response.data.data.bank_account;
        
        setSelectedBankAccount(defaultAccount.id);
      } catch (error) {
        console.error('Error getting default bank account:', error);
        present({
          message: 'Failed to get default bank account',
          duration: 3000,
          color: 'danger',
        });
      }
    };

    getDefaulkBankAccount();
    loadBankAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !amount || !selectedBankAccount) {
      present({
        message: 'Please fill in all required fields',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);

      // First upload files if any
      let fileIds = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        try {
          const uploadResponse = await strapiAPI.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          fileIds = uploadResponse.data.map(file => file.id);
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          throw new Error('Failed to upload photos');
        }
      }

      // Create transaction with image relations
      const transactionData = {
        title: title,
        amount: parseFloat(amount),
        description: description,
        transaction_type: transactionType,
        bank_account: selectedBankAccount,
        date: date,
        ...(fileIds.length > 0 && {
          image: fileIds
        })
      };

      await strapiAPI.post('/transactions', {
        data: transactionData
      });
      
      present({
        message: 'Transaction created successfully',
        duration: 3000,
        color: 'success',
      });

      // Dispatch refresh event before navigation
      window.dispatchEvent(new Event('refresh-transactions'));
      
      history.push('/dashboard');
    } catch (error) {
      console.error('Error creating transaction:', error);
      present({
        message: error.message || 'Failed to create transaction',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Create Transaction</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="form-container">
          <div className="form-frame">
            <h1 className="form-title">Create New Transaction</h1>
            <TransactionForm
              // Form values
              transactionType={transactionType}
              title={title}
              amount={amount}
              description={description}
              selectedBankAccount={selectedBankAccount}
              selectedFiles={selectedFiles}
              bankAccounts={bankAccounts}
              loading={loading}
              date={date}
              
              // Event handlers
              onSubmit={handleSubmit}
              onTransactionTypeChange={setTransactionType}
              onTitleChange={setTitle}
              onAmountChange={setAmount}
              onDescriptionChange={setDescription}
              onBankAccountChange={setSelectedBankAccount}
              onFileSelect={(files) => setSelectedFiles(prevFiles => [...prevFiles, ...files])}
              onFileRemove={(index) => {
                setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
              }}
              onDateChange={setDate}
              
              // Button text
              submitButtonText="Create Transaction"
            />
          </div>
        </div>
        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default CreateTransaction;
