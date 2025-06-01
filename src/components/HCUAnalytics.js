import React from "react";
import { Container, Box, Typography, Paper, Grid } from "@mui/material";
import HCUTrendchartContent from "./Charts/HCUTrendchartContent";

const HCUAnalytics = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 3,
        flexWrap: "wrap" 
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 500,
            color: 'primary.main' 
          }}
        >
          HCU Analytics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 750,
              width:800,
              overflow: 'hidden'
            }}
          >
            <HCUTrendchartContent />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HCUAnalytics;