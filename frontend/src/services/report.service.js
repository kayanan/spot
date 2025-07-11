import axios from 'axios';


export const fetchRevenueByRegion = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'REVENUE_BY_REGION',
    startDate,
    endDate
  });
  return response.data;
};

export const fetchReservationsRevenueByCity = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'RESERVATIONS_REVENUE_BY_CITY',
    startDate,
    endDate
  });
  return response.data;
};

export const fetchRevenueByParkingOwners = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'REVENUE_BY_PARKING_OWNERS',
    startDate,
    endDate
  });
  return response.data;
};

export const fetchSubscriptionPayments = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'SUBSCRIPTION_PAYMENTS_REPORT',
    startDate,
    endDate
  });
  return response.data;
};

// CSV Export functions
export const exportRevenueByRegionCSV = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'REVENUE_BY_REGION',
    startDate,
    endDate,
    format: 'CSV'
  }, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportReservationsRevenueByCityCSV = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'RESERVATIONS_REVENUE_BY_CITY',
    startDate,
    endDate,
    format: 'CSV'
  }, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportRevenueByParkingOwnersCSV = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'REVENUE_BY_PARKING_OWNERS',
    startDate,
    endDate,
    format: 'CSV'
  }, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportSubscriptionPaymentsCSV = async (startDate, endDate) => {
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
    reportType: 'SUBSCRIPTION_PAYMENTS_REPORT',
    startDate,
    endDate,
    format: 'CSV'
  }, {
    responseType: 'blob'
  });
  return response.data;
};

export const generateParkingOwnerDetailedReport = async (startDate, endDate, ownerId) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
      reportType: 'PARKING_OWNER_DETAILED_REPORT',
      startDate,
      endDate,
      ownerId,
      format: 'JSON'
    });
    return response.data;
  } catch (error) {
    console.error('Error generating parking owner detailed report:', error);
    throw error;
  }
};

export const exportParkingOwnerDetailedReportCSV = async (startDate, endDate, ownerId) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_REPORT_BASE_URL}/generate`, {
      reportType: 'PARKING_OWNER_DETAILED_REPORT',
      startDate,
      endDate,
      ownerId,
      format: 'CSV'
    }, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `parking_owner_detailed_report_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting parking owner detailed report CSV:', error);
    throw error;
  }
}; 