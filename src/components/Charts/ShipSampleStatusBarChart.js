import React, { useEffect, useState } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, Button,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress
} from '@mui/material';
import { PieChart, Pie,Cell, label,XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ShipSampleStatusBarChart = ({ dateRange, selectedShips }) => {
  const [data, setData] = useState([]);
  const [shipStatus, setShipStatus] = useState(null);
  const [popupData, setPopupData] = useState([]);
  const [popupTitle, setPopupTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatusData = async () => {
      if (!dateRange?.[0] || !dateRange?.[1]) return;
      setLoading(true);
      try {
        const response = await axios.get('http://52.140.61.220:5000/api/ship-sample-status', {
          params: {
            start_date: dateRange[0].format('YYYY-MM-DD'),
            end_date: dateRange[1].format('YYYY-MM-DD'),
            ship: selectedShips.join(',') || ''
          }
        });

        const result = response.data.ship_sample_status;
        setShipStatus(result);

        const chartData = [
          {
            name: 'Ships Sent Samples',
            count: result.ships_sent_samples?.count || 0,
            type: 'sent'
          },
          {
            name: 'Ships Not Sent Samples',
            count: result.ships_not_sent_samples?.count || 0,
            type: 'not_sent'
          }
        ];

        setData(chartData);
      } catch (err) {
        console.error('Error loading ship status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, [dateRange, selectedShips]);

  const handleBarClick = (entry) => {
    if (!entry || !shipStatus) return;

    if (entry.type === 'sent') {
      setPopupTitle('Ships Sent Samples');
      const sentData = shipStatus.ships_sent_samples?.ships || [];
      const formatted = sentData.map(({ ship, lo_serial_count }) => ({
        ship,
        count: lo_serial_count
      }));
      setPopupData(formatted);
    } else if (entry.type === 'not_sent') {
      setPopupTitle('Ships Not Sent Samples');
      const notSentData = shipStatus.ships_not_sent_samples?.ships || [];
      const formatted = notSentData.map(({ ship }) => ({
        ship,
        count: '-'
      }));
      setPopupData(formatted);
    }

    setDialogOpen(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(popupTitle, 14, 16);
    autoTable(doc, {
      head: [['Ship Name', 'Count']],
      body: popupData.map((row) => [row.ship, row.count]),
    });
    doc.save('ship_sample_status.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      popupData.map((row) => ({ 'Ship Name': row.ship, 'Count': row.count }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ship Sample Status');
    XLSX.writeFile(workbook, 'ship_sample_status.xlsx');
  };

  return (
    <Box sx={{ mt: 4 }}>
      {loading ? (
        <CircularProgress />
      ) : (
<ResponsiveContainer width="100%" height={320}>
  <Box
    display="flex"
    justifyContent="center"
    alignItems="flex-start"
    height="100%"
    px={2}
  >
    <PieChart width={700} height={290}>
      <Tooltip
        formatter={(value) => [`${value}`, 'Ship']}
        labelFormatter={(label) => `${label}`}
      />
      <Pie
  data={data}
  dataKey="count"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
  labelLine={true}
  labelStyle={{ fontSize: 12, fontWeight: 500 }}
>
  {data.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={index === 0 ? '#1976d2' : '#ff7043'} // blue for 'sent', orange for 'not sent'
    />
  ))}
</Pie>




    </PieChart>

    {/* Custom Legend */}
    <Box ml={4} mt={2}>
      {data.map((entry, index) => (
        <Box
          key={index}
          sx={{
            cursor: 'pointer',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            '&:hover': { textDecoration: 'underline' },
            fontSize: '0.9rem'
          }}
          onClick={() => handleBarClick(entry)}
        >
      <Box
  sx={{
    width: 16,
    height: 14,
    borderRadius: '80%',
    backgroundColor: index === 0 ? '#1976d2' : '#ff7043',
    mr: 1,
  }}
/>


          <strong>{entry.name}</strong> ({entry.count})
        </Box>
      ))}
    </Box>
  </Box>
</ResponsiveContainer>

      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{popupTitle}</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Ship Name</strong></TableCell>
                  <TableCell><strong>Count</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {popupData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.ship}</TableCell>
                    <TableCell>{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={exportPDF}>Download PDF</Button>
            <Button variant="outlined" onClick={exportExcel}>Download Excel</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ShipSampleStatusBarChart;
