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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const response = await strapiAPI.get(`/transactions/${id}`, {
          params: {
            populate: ['bank_account', 'image']
          }
        });
        const transaction = response.data.data;
        
        setTitle(transaction.title);
        setDescription(transaction.description || '');
        setAmount(transaction.amount.toString());
        setTransactionType(transaction.transaction_type);
        setSelectedBankAccount(transaction.bank_account?.id || '');

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

    loadBankAccounts();
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
        title,
        description,
        amount: parseFloat(amount),
        transaction_type: transactionType,
        bank_account: selectedBankAccount,
        image: [...existingImageIds, ...fileIds]
      };

      // Update transaction with proper data wrapper
      await strapiAPI.put(`/transactions/${id}`, {
        data: transactionData
      });
      
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
              // Form values
              transactionType={transactionType}
              title={title}
              amount={amount}
              description={description}
              selectedBankAccount={selectedBankAccount}
              selectedFiles={selectedFiles}
              existingFiles={existingImages}
              bankAccounts={bankAccounts}
              loading={loading}
              
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
              onExistingFileRemove={handleRemoveExistingImage}
              
              // Button text
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
