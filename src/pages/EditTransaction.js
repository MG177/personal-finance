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
import { useHistory, useParams } from 'react-router-dom';
import strapiAPI from '../api/strapi';
import '../App.css';

const EditTransaction = () => {
  const history = useHistory();
  const { type, id } = useParams();
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [transactionType, setTransactionType] = useState(type);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [types, setTypes] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  // Load transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'expense' ? '/expanses' : '/incomes';
        const response = await strapiAPI.get(`${endpoint}/${id}?populate=*`);
        const transaction = response.data.data;

        setTitle(transaction.Title);
        setAmount(transaction.Nominal.toString());
        setDate(transaction.Date);
        setNotes(transaction.Note || '');
        
        // Set selected type
        const typeField = type === 'expense' ? 'expense_type' : 'income_type';
        if (transaction[typeField]) {
          setSelectedType({
            documentId: transaction[typeField].documentId,
            title: transaction[typeField].Title
          });
        }

        // Set existing photos
        if (transaction.Photo) {
          const photos = Array.isArray(transaction.Photo) 
            ? transaction.Photo 
            : [transaction.Photo];
          
          setExistingPhotos(photos.map(photo => ({
            id: photo.id,
            url: `${process.env.REACT_APP_STRAPI_URL}${photo.url}`
          })));
        }
      } catch (error) {
        console.error('Error loading transaction:', error);
        present({
          message: 'Failed to load transaction',
          duration: 3000,
          color: 'danger',
        });
        history.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [id, type]);

  // Load expense/income types
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const endpoint = type === 'expense' ? '/expense-types' : '/income-types';
        const response = await strapiAPI.get(endpoint);
        const formattedTypes = response.data.data.map(type => ({
          documentId: type.documentId,
          title: type.Title,
          budget: type.Monthly_Budget
        }));
        setTypes(formattedTypes);

        // If we already have a selectedType, find and update it with the full type info
        if (selectedType) {
          const matchingType = formattedTypes.find(t => t.documentId === selectedType.documentId);
          if (matchingType) {
            setSelectedType({
              documentId: matchingType.documentId,
              title: matchingType.title
            });
          }
        }
      } catch (error) {
        console.error('Error loading types:', error);
        present({
          message: 'Failed to load types',
          duration: 3000,
          color: 'danger',
        });
      }
    };

    loadTypes();
  }, [type, selectedType?.documentId]);

  // Debug logging
  useEffect(() => {
    console.log('Types:', types);
    console.log('Selected Type:', selectedType);
  }, [types, selectedType]);

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

  // Remove existing photo
  const handleRemoveExistingPhoto = async (photoId) => {
    try {
      await strapiAPI.delete(`/upload/files/${photoId}`);
      setExistingPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
      present({
        message: 'Photo removed successfully',
        duration: 3000,
        color: 'success',
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      present({
        message: 'Failed to remove photo',
        duration: 3000,
        color: 'danger',
      });
    }
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
      const endpoint = type === 'expense' ? '/expanses' : '/incomes';
      const typeField = type === 'expense' ? 'expense_type' : 'income_type';

      let fileIds = existingPhotos.map(photo => photo.id);
      
      // Upload new images if any
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
          fileIds = [...fileIds, ...uploadResponse.data.map(file => file.id)];
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          throw new Error('Failed to upload photos');
        }
      }

      // Update transaction
      const transactionData = {
        Title: title,
        Nominal: parseFloat(amount),
        Date: date,
        Note: notes,
        [typeField]: {
          set: [selectedType.documentId]
        },
        ...(fileIds.length > 0 && {
          Photo: fileIds
        })
      };

      await strapiAPI.put(`${endpoint}/${id}`, { data: transactionData });

      present({
        message: 'Transaction updated successfully',
        duration: 3000,
        color: 'success',
      });

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
          <IonButtons slot="end">
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Please wait..." />
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">Edit Transaction</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubmit} className="form-group">
              {/* Transaction Type (disabled in edit mode) */}
              <div className="form-group">
                <select
                  id="transaction-type"
                  value={transactionType}
                  disabled
                  className="custom-select"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <label htmlFor="transaction-type">{"Transaction Type (Disabled)"}</label>
              </div>

              {/* Title */}
              <div className="form-group">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Title"
                  required
                  className="form-control"
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
                  placeholder="Amount"
                  required
                  className="form-control"
                />
                <label htmlFor="amount">Amount</label>
              </div>

              {/* Date */}
              <div className="form-group">
                <IonDatetime
                  value={date}
                  onIonChange={e => setDate(e.detail.value)}
                  className="date-input"
                />
                <label htmlFor="date">Date</label>
              </div>
              

              {/* Type Selection */}
              <div className="form-group">
                <select
                  id="type"
                  value={selectedType?.documentId || ''}
                  onChange={(e) => {
                    const selected = types.find(t => t.documentId === e.target.value);
                    if (selected) {
                      setSelectedType({
                        documentId: selected.documentId,
                        title: selected.title
                      });
                    } else {
                      setSelectedType(null);
                    }
                  }}
                  required
                  className="custom-select"
                  disabled={loading || types.length === 0}
                >
                  <option value="">Select Type</option>
                  {types.map(type => (
                    <option 
                      key={type.documentId} 
                      value={type.documentId}
                      selected={selectedType?.documentId === type.documentId}
                    >
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
                    {/* Existing Photos */}
                    {existingPhotos.map((photo, index) => (
                      <div key={photo.id} className="photo-preview">
                        <img src={photo.url} alt={`Existing ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => handleRemoveExistingPhoto(photo.id)}
                        >
                          <IonIcon icon={closeCircle} />
                        </button>
                      </div>
                    ))}
                    
                    {/* New Photos */}
                    {previewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="photo-preview">
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
                    
                    {/* Upload Placeholder */}
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
                Save Changes
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default EditTransaction;
