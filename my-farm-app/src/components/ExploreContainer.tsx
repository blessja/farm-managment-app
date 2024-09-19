import { useHistory } from "react-router-dom";
import "./ExploreContainer.css";
import { Box, Typography, Button } from "@mui/material";
import { IonButton } from "@ionic/react";

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const history = useHistory();
  return (
    <div style={{ textAlign: "center" }}>
      <Box
        position="relative"
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="500px"
        sx={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1515779689357-8b2b205287d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0, 0, 0, 0.6)" // Semi-transparent overlay
        />
        <Typography
          variant="h4"
          color="white"
          zIndex={1}
          sx={{ fontStyle: "italic", mb: 2 }}
        >
          We take pride in our produce!!!
        </Typography>
      </Box>
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
          }}
        >
          <div>
            {" "}
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              onClick={() => history.push("/checkin")}
            >
              Check-In
            </Button>
          </div>
          <div>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => history.push("/checkout")}
            >
              Check-Out
            </Button>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: "40px" }}>
        <h1>My Farm App</h1>

        <IonButton
          style={{ marginTop: "30px" }}
          onClick={() => history.push("/dashboard")}
          color="primary"
          fill="solid"
          size="large"
        >
          Go to Dashboard
        </IonButton>
      </div>
    </div>
  );
};

export default ExploreContainer;
