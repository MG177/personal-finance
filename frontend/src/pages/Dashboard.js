import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  useIonToast,
  IonAlert
} from '@ionic/react';
import { 
  walletOutline, 
  timeOutline, 
  pricetagOutline,
  arrowUpCircleOutline,
  arrowDownCircleOutline,
  imageOutline,
  filterOutline,
  addOutline,
  createOutline,
  trashOutline,
  ellipsisVertical,
  chevronDownOutline
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import strapiAPI from '../api/strapi';
import qs from 'qs';
import '../App.css';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const history = useHistory();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [present] = useIonToast();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      // Base query parameters without populate
      const baseQueryParams = {
        pagination: {
          page: 1,
          pageSize: 100,
        },
        sort: ['updatedAt:desc'],
      };

      // Add search filter only if search text exists
      if (searchText) {
        baseQueryParams.filters = {
          $or: [
            {
              title: {
                $containsi: searchText
              }
            },
            {
              description: {
                $containsi: searchText
              }
            }
          ]
        };
      }

      // Add date filter if selected and not 'all'
      if (dateRange && dateRange !== 'all') {
        const today = new Date();
        let startDate = new Date();

        switch (dateRange) {
          case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(today.setDate(today.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
          default:
            break;
        }

        // Initialize filters object if it doesn't exist
        if (!baseQueryParams.filters) {
          baseQueryParams.filters = {};
        }
        baseQueryParams.filters.date = {
          $gte: startDate.toISOString(),
        };
      }

      // Base query parameters
      const queryParams = {
        ...baseQueryParams,
        populate: {
          bank_account: {
            fields: ['account_name', 'bank_name', 'currency'],
            populate: {
              icon: {
                fields: ['url']
              }
            }
          },
          image: {
            fields: ['url']
          },
          category: {
            fields: ['category_name'],
            populate: {
              icon: {
                fields: ['url']
              }
            }
          }
        },
        sort: ['date:desc']  // Sort by date in descending order
      };

      // Add transaction type filter if selected
      if (selectedType && selectedType !== 'all') {
        queryParams.filters = {
          ...queryParams.filters,
          transaction_type: selectedType
        };
      }

      const query = qs.stringify(queryParams, {
        encodeValuesOnly: true,
      });

      const transactionsRes = await strapiAPI.get(`/transactions?${query}`);
      const formattedTransactions = transactionsRes.data.data.map(transaction => ({
        ...transaction,
        id: transaction.id,
        type: transaction.transaction_type,
        category: transaction.category?.category_name,
        categoryIconUrl: process.env.REACT_APP_STRAPI_URL + transaction.category?.icon?.url,
        bank_account: transaction.bank_account?.account_name,
        bank_accountIconUrl: process.env.REACT_APP_STRAPI_URL + transaction.bank_account?.icon?.url,
        photoUrl: transaction.image?.[0]?.url
      }));

      setTransactions(formattedTransactions);

      setLoading(false);
    } catch (error) {
      console.error('Error loading transactions:', error);
      present({
        message: 'Failed to load transactions',
        duration: 3000,
        color: 'danger',
      });
      setLoading(false);
    }
  }, [searchText, selectedType, dateRange]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Listen for navigation events
  useEffect(() => {
    // Subscribe to ionRouter:didEnter event
    document.addEventListener('ionRouter:didEnter', (e) => {
      if (e.detail.to === '/dashboard') {
        fetchTransactions();
      }
    });

    return () => {
      document.removeEventListener('ionRouter:didEnter', (e) => {
        if (e.detail.to === '/dashboard') {
          fetchTransactions();
        }
      });
    };
  }, [fetchTransactions]);

  // Listen for custom refresh event
  useEffect(() => {
    const handleRefresh = () => {
      fetchTransactions();
    };

    window.addEventListener('refresh-transactions', handleRefresh);

    return () => {
      window.removeEventListener('refresh-transactions', handleRefresh);
    };
  }, [fetchTransactions]);

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, type) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));

    return type === 'expense' ? `-${formatted}` : formatted;
  };

  const getTransactionIcon = (type) => {
    return type === 'expense' ? arrowDownCircleOutline : arrowUpCircleOutline;
  };

  const getTransactionColor = (type) => {
    return type === 'expense' ? 'expense-amount' : 'income-amount';
  };

  const handleEdit = (transaction) => {
    history.push(`/edit-transaction/${transaction.type}/${transaction.documentId}`);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const endpoint = transactionToDelete.type === 'expense' ? '/expanses' : '/incomes';
      await strapiAPI.delete(`${endpoint}/${transactionToDelete.id}`);
      
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      present({
        message: 'Transaction deleted successfully',
        duration: 3000,
        color: 'success'
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      present({
        message: 'Failed to delete transaction',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setShowDeleteAlert(false);
      setTransactionToDelete(null);
    }
  };

  const toggleDescription = (transactionId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              Logout
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="dashboard-container">
          {/* Search and Filter Section */}
          <div className="search-filter-container">
            <div className="filter-section">
              <IonSegment 
                value={selectedType} 
                onIonChange={e => setSelectedType(e.detail.value)}
                className="custom-segment"
              >
                <IonSegmentButton value="all" className="segment-button">
                  <IonLabel>All</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="expense" className="segment-button">
                  <IonLabel>Expenses</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="income" className="segment-button">
                  <IonLabel>Incomes</IonLabel>
                </IonSegmentButton>
              </IonSegment>
              <div className='flex flex-row gap-4 w-full flex-grow mt-4'>
              {/* <div> */}
                <div className="search-box w-full">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value)}
                    placeholder="Search transactions..."
                    debounce={1000}
                    className="custom-searchbar"
                  />
                </div>
                <div className="date-box">
                  <IonSelect
                    value={dateRange}
                    placeholder="Select Date Range"
                    onIonChange={e => setDateRange(e.detail.value)}
                    interface="popover"
                    className="custom-searchbar"
                  >
                    <IonSelectOption value="all">All Time</IonSelectOption>
                    <IonSelectOption value="today">Today</IonSelectOption>
                    <IonSelectOption value="week">Last Week</IonSelectOption>
                    <IonSelectOption value="month">Last Month</IonSelectOption>
                  </IonSelect>
                </div>
                </div>
            </div>
          </div>

          {/* Transactions List */}
          <IonCard className="expense-card">
            <IonCardHeader>
              <IonCardTitle>Recent Transactions</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loading ? (
                <div className="ion-text-center ion-padding">
                  <IonSpinner />
                </div>
              ) : transactions.length === 0 ? (
                <p className="ion-text-center">No transactions found</p>
              ) : (
                <IonList>
                  {transactions.map((transaction) => (
                    <IonItem key={transaction.id} className="transaction-item">
                      <div className={`transaction-content ${transaction.type}`}>
                        <div className="transaction-photo">
                          {transaction.photoUrl ? (
                            <img 
                              src={`${process.env.REACT_APP_STRAPI_URL}${transaction.photoUrl}`} 
                              alt={transaction.title}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                const placeholder = document.createElement('div');
                                placeholder.className = 'photo-placeholder';
                              placeholder.innerHTML = `
                                <div class="placeholder-content">
                                  <IonIcon icon={imageOutline} />
                                </div>
                              `;
                                parent.appendChild(placeholder);
                              }}
                            />
                          ) : (
                            <div className="photo-placeholder">
                              <IonIcon icon={imageOutline} />
                            </div>
                          )}
                        </div>
                        
                        <div className="transaction-details">
                          <div className="transaction-header">
                            <div className="transaction-title-group">
                              <h2 className="transaction-title">
                                <IonIcon 
                                  icon={getTransactionIcon(transaction.type)} 
                                  className={`${transaction.type}-icon`}
                                />
                                <span>{transaction.title}</span>
                              </h2>
                            </div>
                            <div className="transaction-meta">
                              <div className="meta-item">
                                <img 
                                  src={transaction.categoryIconUrl || '/no-image-available-icon.jpg'} 
                                  alt=""
                                  className="meta-icon"
                                  onError={(e) => {
                                    e.target.src = '/no-image-available-icon.jpg';
                                  }}
                                />
                                <span className="transaction-type">
                                  {transaction.category}
                                </span>
                              </div>
                              <div className="meta-item">
                                <img 
                                  src={transaction.bank_accountIconUrl || '/no-image-available-icon.jpg'}
                                  alt=""
                                  className="meta-icon"
                                  onError={(e) => {
                                    e.target.src = '/no-image-available-icon.jpg';
                                  }}
                                />
                                <span className="transaction-type">
                                  {transaction.bank_account}
                                </span>
                              </div>
                              <div className="meta-item">
                                <IonIcon icon={timeOutline} className="meta-icon" />
                                <span className="transaction-date">
                                  {formatDate(transaction.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {transaction.description && (
                            <>
                              <div 
                                className={`description-toggle ${expandedDescriptions[transaction.id] ? 'expanded' : ''}`}
                                onClick={() => toggleDescription(transaction.id)}
                              >
                                <span>Notes</span>
                                <IonIcon icon={chevronDownOutline} />
                              </div>
                              <div 
                                className={`transaction-description ${!expandedDescriptions[transaction.id] ? 'hidden' : ''}`}
                              >
                                <BlocksRenderer content={transaction.description} />
                              </div>
                            </>
                          )}
                        </div>
                        <div className='flex flex-col items-end'>
                          <div className={`transaction-amount ${transaction.type}-amount`}>
                            {formatCurrency(transaction.amount, transaction.type)}
                          </div>
                          
                          <div className="transaction-actions">
                                <IonButton
                                  fill="clear"
                                  onClick={() => handleEdit(transaction)}
                                  className="action-button"
                                >
                                  <IonIcon slot="icon-only" icon={createOutline} />
                                </IonButton>
                                <IonButton
                                  fill="clear"
                                  onClick={() => handleDeleteClick(transaction)}
                                  className="action-button"
                                >
                                  <IonIcon slot="icon-only" icon={trashOutline} />
                                </IonButton>
                              </div>
                        </div>
                      </div>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* Floating Action Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/create-transaction">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => {
            setShowDeleteAlert(false);
            setTransactionToDelete(null);
          }}
          header="Confirm Delete"
          message={`Are you sure you want to delete this ${transactionToDelete?.type || 'transaction'}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDeleteConfirm
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
