import React from "react";
import { Container, Box, Typography, Paper, Grid } from "@mui/material";
import HCUAveragechart from "./Charts/HCUAveragechart";

const HCUAverage = () => {
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
          HCU Average
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
              height: 700,
              overflow: 'hidden'
            }}
          >
            <HCUAveragechart />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HCUAverage;