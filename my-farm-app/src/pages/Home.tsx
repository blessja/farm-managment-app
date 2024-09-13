// src/pages/Home.tsx
import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Header from '../components/Header'; // Import Header
import ExploreContainer from '../components/ExploreContainer';

const Home: React.FC = () => {
  return (
    <IonPage>
      <Header /> {/* Use the shared Header */}
      <IonContent fullscreen>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
