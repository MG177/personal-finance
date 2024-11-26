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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [date, setDate] = useState(new Date().toISOString());

  // Load bank accounts and categories
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
    
    const loadCategories = async () => {
      try {
        const response = await strapiAPI.get('/categories', {
          params: {
            populate: 'icon'
          }
        });
        const formattedCategories = response.data.data.map(category => ({
          id: category.id,
          name: category.category_name,
          iconUrl: category.icon?.url
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        present({
          message: 'Failed to load categories',
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
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!title || !amount || !selectedBankAccount || !selectedCategory) {
      setLoading(false);
      present({
        message: 'Please fill in all required fields',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    try {
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

      // Create transaction
      const transactionData = {
        data: {
          title,
          amount: parseFloat(amount),
          description,
          transaction_type: transactionType,
          bank_account: selectedBankAccount,
          category: selectedCategory,
          date,
          image: fileIds.length > 0 ? fileIds : undefined
        }
      };

      await strapiAPI.post('/transactions', transactionData);
      
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

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  const handleFileSelect = (files) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleFileRemove = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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
              transactionType={transactionType}
              title={title}
              amount={amount}
              description={description}
              selectedBankAccount={selectedBankAccount}
              selectedCategory={selectedCategory}
              selectedFiles={selectedFiles}
              bankAccounts={bankAccounts}
              categories={categories}
              loading={loading}
              date={date}
              onSubmit={handleSubmit}
              onTransactionTypeChange={setTransactionType}
              onTitleChange={setTitle}
              onAmountChange={setAmount}
              onDescriptionChange={handleDescriptionChange}
              onBankAccountChange={setSelectedBankAccount}
              onCategoryChange={setSelectedCategory}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onDateChange={setDate}
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
