import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  useIonToast,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      history.push('/dashboard');
    } catch (error) {
      present({
        message: error.toString(),
        duration: 3000,
        color: 'danger',
      });
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">Login</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
                <label htmlFor="email">Email</label>
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <label htmlFor="password">Password</label>
              </div>

              <IonButton
                expand="block"
                type="submit"
                className="ion-margin-top"
              >
                Login
              </IonButton>
            </form>

            <IonText className="ion-text-center ion-margin-top">
              <p>
                Don't have an account?{' '}
                <IonButton
                  fill="clear"
                  routerLink="/register"
                  className="ion-no-padding"
                >
                  Register
                </IonButton>
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Login;
