// src/components/Header.tsx
import React from "react";
import { IonHeader, IonToolbar, IonTitle } from "@ionic/react";

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>
          Glen Oak ||{" "}
          <span style={{ fontSize: "0.6em" }}>
            Farm Management Activity v1.0
          </span>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
