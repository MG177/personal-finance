import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonDatetime,
  useIonToast,
  IonIcon,
} from '@ionic/react';
import { camera, closeCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import strapiAPI from '../api/strapi';
import '../App.css';

const CreateTransaction = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [transactionType, setTransactionType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [types, setTypes] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Load expense/income types based on transaction type
  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoading(true);
        const endpoint = transactionType === 'expense' ? '/expense-types' : '/income-types';
        const response = await strapiAPI.get(endpoint);
        const formattedTypes = response.data.data.map(type => ({
          documentId: type.documentId,
          id: type.id,
          title: type.Title,
          budget: type.Monthly_Budget
        }));
        setTypes(formattedTypes);
        setSelectedType(''); // Reset selected type when switching
      } catch (error) {
        console.error('Error loading types:', error);
        present({
          message: 'Failed to load types',
          duration: 3000,
          color: 'danger',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, [transactionType]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
      
      // Generate preview URLs for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prevUrls => [...prevUrls, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove selected photo
  const handleRemovePhoto = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !amount || !selectedType) {
      present({
        message: 'Please fill in all required fields',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const endpoint = transactionType === 'expense' ? '/expanses' : '/incomes';
      const typeField = transactionType === 'expense' ? 'expense_type' : 'income_type';

      let fileIds = [];
      
      // First, upload images if any
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

      console.log(fileIds);
      

      // Then create transaction with image relations
      const transactionData = {
        Title: title,
        Nominal: parseFloat(amount),
        Date: date,
        Note: notes,
        [typeField]: {
          connect: [selectedType]
        },
        ...(fileIds.length > 0 && {
          Photo: fileIds
        })
      };

      await strapiAPI.post(endpoint, { data: transactionData });

      present({
        message: 'Transaction created successfully',
        duration: 3000,
        color: 'success',
      });

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
          <IonButtons slot="end">
            <IonButton onClick={handleSubmit} strong={true}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">Create Transaction</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubmit} className="form-group">
              {/* Transaction Type Selector */}
              <div className="form-group">
                <select
                  id="transaction-type"
                  value={transactionType}
                  onChange={e => setTransactionType(e.target.value)}
                  required
                  className="custom-select"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <label htmlFor="transaction-type">Transaction Type</label>
              </div>

              {/* Title */}
              <div className="form-group">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Enter title"
                />
                <label htmlFor="title">Title</label>
              </div>

              {/* Amount */}
              <div className="form-group">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  placeholder="Enter amount"
                  step="0.01"
                />
                <label htmlFor="amount">Amount</label>
              </div>

              {/* Date */}
              <div className="form-group">
                <IonDatetime
                  id="date"
                  value={date}
                  onIonChange={e => setDate(e.detail.value)}
                  displayFormat="MMM DD, YYYY"
                  max={new Date().getFullYear() + 5}
                  min="2000"
                  className="date-input"
                />
                <label htmlFor="date">Date</label>
              </div>

              {/* Type Selection */}
              <div className="form-group">
                <select
                  id="type"
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  required
                  className="custom-select"
                >
                  <option value="">Select type</option>
                  {types.map(type => (
                    <option key={type.documentId} value={type.documentId}>
                      {type.title}
                    </option>
                  ))}
                </select>
                <label htmlFor="type">
                  {transactionType === 'expense' ? 'Expense Type' : 'Income Type'}
                </label>
              </div>

              {/* Notes */}
              <div className="form-group">
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter notes (optional)"
                  rows={4}
                  className="custom-textarea"
                />
                <label htmlFor="notes">Notes</label>
              </div>

              {/* Photo Upload */}
              <div className="form-group photo-upload-container">
                <label htmlFor="photo" className="photo-upload-label">
                  Photos (optional)
                </label>
                <div className="photo-upload-content">
                  <div className="photos-grid">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="photo-preview">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <IonIcon icon={closeCircle} />
                        </button>
                      </div>
                    ))}
                    <div 
                      className="photo-upload-placeholder"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <IonIcon icon={camera} />
                      <span>Add Photos</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="photo"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    multiple
                  />
                </div>
              </div>

              <IonButton
                expand="block"
                type="submit"
                className="ion-margin-top"
              >
                Save Transaction
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default CreateTransaction;
