// src/pages/Home.tsx
import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ExploreContainer from "../components/ExploreContainer";

const Home: React.FC = () => {
  return (
    <>
      <IonPage>
        <IonContent>
          <Header />
          <ExploreContainer />
          <Footer />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Home;
