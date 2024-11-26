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
import { useHistory, useParams } from 'react-router-dom';
import strapiAPI from '../api/strapi';
import TransactionForm from '../components/form/TransactionForm';
import '../App.css';

const EditTransaction = () => {
  const history = useHistory();
  const { id } = useParams();
  const [present] = useIonToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString());

  // Load transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const response = await strapiAPI.get(`/transactions/${id}`, {
          params: {
            populate: ['bank_account', 'category', 'image']
          }
        });
        const transaction = response.data.data;
        
        setTitle(transaction.title);
        setDescription(transaction.description || []);
        setAmount(transaction.amount.toString());
        setTransactionType(transaction.transaction_type);
        setSelectedBankAccount(transaction.bank_account?.id || '');
        setSelectedCategory(transaction.category?.id || '');
        setDate(transaction.date || new Date().toISOString());

        // Handle existing images
        if (transaction.image) {
          const images = Array.isArray(transaction.image) 
            ? transaction.image 
            : [transaction.image];
          
          setExistingImages(images.filter(Boolean).map(img => ({
            id: img.id,
            url: `${process.env.REACT_APP_STRAPI_URL}${img.url}`
          })));
        }
        
      } catch (error) {
        console.error('Error loading transaction:', error);
        present({
          message: 'Failed to load transaction',
          duration: 3000,
          color: 'danger',
        });
      }
    };

    loadTransaction();
  }, [id]);

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

    loadBankAccounts();
    loadCategories();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  // Handle file removal
  const handleFileRemove = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Handle removing existing image
  const handleRemoveExistingImage = async (imageId) => {
    try {
      await strapiAPI.delete(`/upload/files/${imageId}`);
      setExistingImages(prevImages => prevImages.filter(img => img.id !== imageId));
      present({
        message: 'Image removed successfully',
        duration: 3000,
        color: 'success',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      present({
        message: 'Failed to remove image',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  // Handle form submission
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
      // First upload new files if any
      let fileIds = [];
      if (selectedFiles.length > 0) {
        const filesFormData = new FormData();
        
        // Append each file with the key 'files'
        for (let i = 0; i < selectedFiles.length; i++) {
          filesFormData.append('files', selectedFiles[i], selectedFiles[i].name);
        }

        try {
          const uploadResponse = await strapiAPI.post('/upload', filesFormData, {
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

      // Get existing image IDs
      const existingImageIds = existingImages.map(img => img.id);

      // Prepare transaction data
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

      // Update transaction with proper data wrapper
      await strapiAPI.put(`/transactions/${id}`, transactionData);
      
      present({
        message: 'Transaction updated successfully',
        duration: 3000,
        color: 'success',
      });

      // Dispatch refresh event before navigation
      window.dispatchEvent(new Event('refresh-transactions'));
      
      history.push('/dashboard');
    } catch (error) {
      console.error('Error updating transaction:', error);
      present({
        message: error.message || 'Failed to update transaction',
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Edit Transaction</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="form-container">
          <div className="form-frame">
            <h1 className="form-title">Edit Transaction Details</h1>
            <TransactionForm
              transactionType={transactionType}
              title={title}
              amount={amount}
              description={description}
              selectedBankAccount={selectedBankAccount}
              selectedCategory={selectedCategory}
              selectedFiles={selectedFiles}
              existingFiles={existingImages}
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
              onExistingFileRemove={handleRemoveExistingImage}
              onDateChange={setDate}
              submitButtonText="Update Transaction"
            />
          </div>
        </div>
        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default EditTransaction;
