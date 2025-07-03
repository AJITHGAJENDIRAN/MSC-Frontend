import React, { useState, useEffect } from "react";
import { Spin, Alert } from "antd";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const ShipPurifierLineChart = ({ dateRange, selectedShips }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://52.140.61.220:5000/api/purifier-count", {
        params: {
          start_date: startDate,
          end_date: endDate,
          ...(selectedShips.length > 0 && { ships: selectedShips.join(",") })
        }
      });

      const responseData = response.data || {};

      const formattedData = Object.entries(responseData)
        .filter(([ship]) => selectedShips.length === 0 || selectedShips.includes(ship))
        .map(([ship, count]) => ({
          ship_name: ship,
          count: count,
        }))
        .sort((a, b) => b.count - a.count);

      setData(formattedData);
    } catch (err) {
      console.error("Error fetching purifier data:", err);
      setError("Failed to fetch purifier data. Please try again later.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;

    const startDate = dayjs(dateRange[0]).format("YYYY-MM-DD");
    const endDate = dayjs(dateRange[1]).format("YYYY-MM-DD");

    fetchData(startDate, endDate);
  }, [dateRange, selectedShips]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", height: 200, alignItems: "center" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "8px", borderRadius: 6 }}
        />
      ) : data.length === 0 ? (
        <Alert
          message="No data available for the selected date range."
          type="info"
          showIcon
          style={{ marginBottom: "8px", borderRadius: 6 }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="ship_name"
              angle={-60}
              textAnchor="end"
              interval={0}
              height={80}
              tick={{ fill: "#555", fontSize: 11 }}
            />
            <YAxis
              label={{
                value: "Purifier Count",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fill: "#333", fontSize: 12 },
              }}
              tick={{ fill: "#555", fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              cursor={{ fill: "rgba(82,196,26,0.1)" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <Bar
              dataKey="count"
              name="Purifier Count"
              fill="#52c41a"
              barSize={40}
              radius={[4, 4, 0, 0]}
              label={{ position: "top", fill: "#333", fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ShipPurifierLineChart;
