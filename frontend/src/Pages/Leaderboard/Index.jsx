import React from "react";
import { Container } from "@mui/material";

const Leaderboard = () => {
  return (
    <>
      <Container style={{ width: "100vw", height: "100vh" }}>
        <iframe
          title="Leaderboard"
          width="600"
          height="450"
          src="https://lookerstudio.google.com/embed/reporting/af4e1a74-ecf4-4fee-8e5d-b341a2054bf5/page/EvxYD"
          frameborder="0"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            border: "none",
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allowfullscreen
        ></iframe>
      </Container>
    </>
  );
};

export default Leaderboard;
