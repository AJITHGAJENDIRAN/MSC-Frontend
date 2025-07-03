import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import dayjs from "dayjs";

const COLORS = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f"];

const PieChartComponent = ({ dateRange, selectedShips }) => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = useCallback(async () => {
  try {
    const params = new URLSearchParams();

    if (dateRange?.[0]) {
      params.append("start_date", dayjs(dateRange[0]).format("YYYY-MM-DD"));
    }
    if (dateRange?.[1]) {
      params.append("end_date", dayjs(dateRange[1]).format("YYYY-MM-DD"));
    }

    if (selectedShips && selectedShips.length > 0) {
      // For comma-separated format:
      params.append("ships", selectedShips.join(","));

      // OR: For repeated key format (if Flask uses getlist):
      // selectedShips.forEach(ship => params.append("ships", ship));
    }

    const url = `http://52.140.61.220:5000/api/sample-type-count${params.toString() ? `?${params.toString()}` : ""}`;
    
    const response = await axios.get(url);

    const chartData = Object.keys(response.data).map((key, index) => ({
      name: key,
      value: response.data[key],
      color: COLORS[index % COLORS.length],
    }));

    setData(chartData);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    setData([]);
  }
}, [dateRange, selectedShips]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={600}></Typography>

      <Box sx={{ flex: 1, minHeight: 240 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="50%"
                outerRadius="80%"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                layout="horizontal"
                iconSize={10}
                wrapperStyle={{
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PieChartComponent;
