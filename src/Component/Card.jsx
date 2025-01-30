import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import './Card.css';

export default function ReportSummary() {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]); // تغيير هنا لتمثيل أكثر من موقع
  const [siteOptions, setSiteOptions] = useState([]);

  useEffect(() => {
    const fetchProductCodes = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const { data } = await axios.get('https://cms-prod.menta-lb.com/api/v1/productCodes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // تحويل البيانات إلى الشكل المناسب لـ react-select
        const options = data.productCodeRequests.map(product => ({
          value: product.productCode,
          label: product.productCode,
        }));
        setSiteOptions(options);
      } catch (error) {
        console.error('Error fetching product codes:', error.response?.data || error.message);
      }
    };
    fetchProductCodes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const selectedProductCodes = selectedSites.map(site => site.value).join(',');
      const { data } = await axios.get(`https://cms-prod.menta-lb.com/api/card-details/recordsByProducts`, {
        params: {
          productCodes: selectedProductCodes,
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      let totalSuccess = 0, totalFailed = 0, totalPending = 0, totalCanceled = 0;

      const records = data.map(record => {
        const success = record.thalesStatus === 'PROD_OK' ? 1 : 0;
        const failed = record.thalesStatus === 'failed' ? 1 : 0;
        const pending = record.thalesStatus === null ? 1 : 0;
        const canceled = record.thalesStatus === 'cancel' ? 1 : 0;

        totalSuccess += success;
        totalFailed += failed;
        totalPending += pending;
        totalCanceled += canceled;

        return {
          siteId: record.id,
          name: record.cardHolderName,
          branch: record.branch,
          success,
          failed,
          pending,
          canceled,
          total: 1,
        };
      });

      setReportData([...records, {
        siteId: 'Total',
        name: '',
        branch: '',
        success: totalSuccess,
        failed: totalFailed,
        pending: totalPending,
        canceled: totalCanceled,
        total: totalSuccess + totalFailed + totalPending + totalCanceled,
      }]);
    } catch (error) {
      console.error('Error fetching records:', error.response?.data || error.message);
    }
  };

  return (
    <div className="report-container">
      <h2 className="report-title">Data Bage</h2>
      <form onSubmit={handleSubmit} className="report-form">
        <div className="input-group">
          <label htmlFor="productCode">Product Code:</label>
          <Select
            isMulti
            options={siteOptions}
            value={selectedSites}
            onChange={setSelectedSites}
            className="site-select"
          />
        </div>
        <DatePicker selected={fromDate} onChange={setFromDate} className="date-picker" />
        <DatePicker selected={toDate} onChange={setToDate} className="date-picker" />
        <button type="submit" className="submit-button">Search</button>
      </form>
      <table className="report-table">
        <thead>
          <tr>
            <th>Site ID</th>
            <th>Name</th>
            <th>Branch</th>
            <th>Success</th>
            <th>Failed</th>
            <th>Pending</th>
            <th>Canceled</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((record, index) => (
            <tr key={index} className={record.siteId === 'Total' ? 'total-row' : ''}>
              <td>{record.siteId}</td>
              <td>{record.name}</td>
              <td>{record.branch}</td>
              <td>{record.success}</td>
              <td>{record.failed}</td>
              <td>{record.pending}</td>
              <td>{record.canceled}</td>
              <td>{record.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
