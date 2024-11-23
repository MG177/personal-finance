import React from 'react';
import { useEffect, useState } from 'react';
import strapiAPI from './api/strapi';
import { 
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTransaction from './pages/CreateTransaction';
import EditTransaction from './pages/EditTransaction';

setupIonicReact();

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    strapiAPI.get('users')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/create-transaction" component={CreateTransaction} />
            <PrivateRoute exact path="/edit-transaction/:type/:id" component={EditTransaction} />
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/data">
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Personal Finance</IonTitle>
                </IonToolbar>
              </IonHeader>
              <IonContent className="ion-padding">
                {loading && (
                  <div className="ion-text-center">
                    <IonSpinner />
                  </div>
                )}
                {error && (
                  <IonCard color="danger">
                    <IonCardContent>
                      Error: {error}
                    </IonCardContent>
                  </IonCard>
                )}
                {data && (
                  <IonCard>
                    <IonCardContent>
                      <pre>{JSON.stringify(data, null, 2)}</pre>
                    </IonCardContent>
                  </IonCard>
                )}
              </IonContent>
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
}

export default App;
