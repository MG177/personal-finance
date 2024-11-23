import React, { useState, useEffect } from 'react';
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
  useIonToast
} from '@ionic/react';
import { 
  walletOutline, 
  timeOutline, 
  pricetagOutline,
  arrowUpCircleOutline,
  arrowDownCircleOutline,
  imageOutline,
  filterOutline
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import strapiAPI from '../api/strapi';
import qs from 'qs';
import '../App.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const history = useHistory();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [present] = useIonToast();

  useEffect(() => {
    fetchTransactions();
  }, [searchText, selectedType, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Base query parameters without populate
      const baseQueryParams = {
        pagination: {
          page: 1,
          pageSize: 100,
        },
        sort: ['Date:desc'],
      };

      // Add search filter only if search text exists
      if (searchText) {
        baseQueryParams.filters = {
          $or: [
            {
              Title: {
                $containsi: searchText
              }
            },
            {
              Note: {
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
        baseQueryParams.filters.Date = {
          $gte: startDate.toISOString(),
        };
      }

      // Expense query parameters
      const expenseQueryParams = {
        ...baseQueryParams,
        populate: {
          expense_type: {
            fields: ['Title', 'Monthly_Budget']
          },
          Photo: {
            fields: ['url']
          }
        }
      };

      // Income query parameters
      const incomeQueryParams = {
        ...baseQueryParams,
        populate: {
          income_type: {
            fields: ['Title', 'Monthly_Budget']
          },
          Photo: {
            fields: ['url']
          }
        }
      };

      // Add transaction type filter if selected
      if (selectedType && selectedType !== 'all') {
        if (selectedType === 'expense') {
          const expenseQuery = qs.stringify(expenseQueryParams, {
            encodeValuesOnly: true,
          });
          const expensesRes = await strapiAPI.get(`/expanses?${expenseQuery}`);
          const expenses = expensesRes.data.data.map(expense => ({
            ...expense,
            id: expense.id,
            type: 'expense',
            category: expense.expense_type?.data?.Title,
            photoUrl: expense.Photo?.[0]?.url
          }));
          setTransactions(expenses);
        } else {
          const incomeQuery = qs.stringify(incomeQueryParams, {
            encodeValuesOnly: true,
          });
          const incomesRes = await strapiAPI.get(`/incomes?${incomeQuery}`);
          const incomes = incomesRes.data.data.map(income => ({
            ...income,
            id: income.id,
            type: 'income',
            category: income.income_type?.data?.Title,
            photoUrl: income.Photo?.[0]?.url
          }));
          setTransactions(incomes);
        }
      } else {
        // Fetch both expenses and incomes
        const expenseQuery = qs.stringify(expenseQueryParams, {
          encodeValuesOnly: true,
        });
        const incomeQuery = qs.stringify(incomeQueryParams, {
          encodeValuesOnly: true,
        });

        const [expensesRes, incomesRes] = await Promise.all([
          strapiAPI.get(`/expanses?${expenseQuery}`),
          strapiAPI.get(`/incomes?${incomeQuery}`)
        ]);

        // Format expenses
        const expenses = expensesRes.data.data.map(expense => ({
          ...expense,
          id: expense.id,
          type: 'expense',
          category: expense.expense_type?.data?.Title,
          photoUrl: expense.Photo?.[0]?.url
        }));

        // Format incomes
        const incomes = incomesRes.data.data.map(income => ({
          ...income,
          id: income.id,
          type: 'income',
          category: income.income_type?.data?.Title,
          photoUrl: income.Photo?.[0]?.url
        }));

        // Combine and sort all transactions
        const allTransactions = [...expenses, ...incomes].sort((a, b) => 
          new Date(b.Date) - new Date(a.Date)
        );

        setTransactions(allTransactions);
      }

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
  };

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

    return type === 'expense' ? `- ${formatted}` : formatted;
  };

  const getTransactionIcon = (type) => {
    return type === 'expense' ? arrowDownCircleOutline : arrowUpCircleOutline;
  };

  const getTransactionColor = (type) => {
    return type === 'expense' ? 'expense-amount' : 'income-amount';
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
            <div className="search-box">
              <IonSearchbar
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value)}
                placeholder="Search transactions..."
                className="custom-searchbar"
              />
            </div>
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

              <IonSelect
                value={dateRange}
                placeholder="Select Date Range"
                onIonChange={e => setDateRange(e.detail.value)}
                className="custom-select"
                interface="popover"
              >
                <IonSelectOption value="all">All Time</IonSelectOption>
                <IonSelectOption value="today">Today</IonSelectOption>
                <IonSelectOption value="week">Last Week</IonSelectOption>
                <IonSelectOption value="month">Last Month</IonSelectOption>
              </IonSelect>
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
                      <div className="transaction-photo">
                        {transaction.photoUrl ? (
                          <img 
                            src={`http://localhost:1337${transaction.photoUrl}`} 
                            alt={transaction.Title}
                          />
                        ) : (
                          <div className="photo-placeholder">
                            <IonIcon icon={imageOutline} />
                          </div>
                        )}
                      </div>
                      <IonLabel>
                        <h2 className="expense-title">
                          <IonIcon 
                            icon={getTransactionIcon(transaction.type)} 
                            className={`ion-margin-end ${transaction.type}-icon`}
                          />
                          {transaction.Title}
                          <span className="transaction-type">
                            {transaction.type === 'expense' 
                              ? transaction.expense_type?.data?.Title
                              : transaction.income_type?.data?.Title
                            }
                          </span>
                        </h2>
                        <p className={getTransactionColor(transaction.type)}>
                          <IonIcon icon={walletOutline} className="ion-margin-end" />
                          {formatCurrency(transaction.Nominal, transaction.type)}
                        </p>
                        <p className="expense-date">
                          <IonIcon icon={timeOutline} className="ion-margin-end" />
                          {formatDate(transaction.Date)}
                        </p>
                        {transaction.Note && (
                          <p className="expense-note">
                            Note: {transaction.Note}
                          </p>
                        )}
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
