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

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      present({
        message: 'Passwords do not match',
        duration: 3000,
        color: 'danger',
      });
      return;
    }

    try {
      await register(username, email, password);
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
            <IonCardTitle className="ion-text-center">Register</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                />
                <label htmlFor="username">Username</label>
              </div>

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

              <div className="form-group">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>

              <IonButton
                expand="block"
                type="submit"
                className="ion-margin-top"
              >
                Register
              </IonButton>
            </form>

            <IonText className="ion-text-center ion-margin-top">
              <p>
                Already have an account?{' '}
                <IonButton
                  fill="clear"
                  routerLink="/login"
                  className="ion-no-padding"
                >
                  Login
                </IonButton>
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Register;
