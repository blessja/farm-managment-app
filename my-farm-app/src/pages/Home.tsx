// src/pages/Home.tsx
import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ExploreContainer from "../components/ExploreContainer";

const Home: React.FC = () => {
  return (
    <IonPage>
      <div>
        <IonContent fullscreen>
          <Header />
          <ExploreContainer />
          <Footer />
        </IonContent>
      </div>
    </IonPage>
  );
};

export default Home;
