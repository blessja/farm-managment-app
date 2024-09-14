import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#333",
        color: "white",
        textAlign: "center",
        padding: "20px 0",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Typography variant="body2" component="p">
        &copy; {new Date().getFullYear()} My Farm App. All rights reserved.
      </Typography>
      <Box mt={1}>
        <Link
          href="https://example.com/privacy-policy"
          color="inherit"
          sx={{ marginRight: 2 }}
        >
          Privacy Policy
        </Link>
        <Link href="https://example.com/terms" color="inherit">
          Terms of Service
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
