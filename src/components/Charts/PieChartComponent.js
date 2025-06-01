import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";

const COLORS = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f"];

const PieChartComponent = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = useCallback(async () => {
    try {
      let url = "http://localhost:5000/api/sample-type-count";

      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url);

      const chartData = Object.keys(response.data).map((key, index) => ({
        name: key,
        value: response.data[key],
        color: COLORS[index % COLORS.length],
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 4,
        width: "100%",
        alignItems: isMobile ? "stretch" : "flex-start",
        justifyContent: "space-between",
      }}
    >
      {/* Filters Section */}
      <Box
        sx={{
          width: isMobile ? "100%" : 280,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button variant="contained" onClick={fetchData}>
          Apply Filters
        </Button>
      </Box>

      {/* Chart Section */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          width: "100%",
        }}
      >
        {data.length > 0 ? (
          <PieChart width={isMobile ? 300 : 400} height={isMobile ? 300 : 400}>
            
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 80 : 120}  
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "0px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend verticalAlign="bottom" iconType="circle" />
          </PieChart>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PieChartComponent;
