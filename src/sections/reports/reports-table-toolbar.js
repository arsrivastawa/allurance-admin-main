import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Upload from 'src/components/upload/upload';
import Papa from 'papaparse';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { REPORTS_LISTING } from 'src/utils/apiEndPoints';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function OrderTableToolbar({ filters, onFilters, dateError }) {
  const popover = usePopover();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState({});
  const [modelNumbers, setModelNumbers] = useState([]);
  const [csvType, setCsvType] = useState('');
  const [apiData, setApiData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('batch_number', event.target.value);
    },
    [onFilters]
  );

  const handleFilterModelNumber = useCallback(
    (event) => {
      onFilters('model_number', event.target.value);
    },
    [onFilters]
  );

  const handleFilterBatchNumber = useCallback(
    (event) => {
      onFilters('packing_request_id', event.target.value);
    },
    [onFilters]
  );

  const handleOpenUploadDialog = (type) => {
    setCsvType(type);
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setUploadedFile(null);
    setModelNumbers([]);
  };

  const HandleCSVFileChange = async (event) => {
    const file = event[0];

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }

    try {
      const text = await file.text();
      const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });

      if (errors.length > 0) {
        console.warn('Parsing warnings:', errors);
      }

      if (csvType === 'model_number') {
        const extractedModelNumbers = data
          .filter((row) => row.model_number && row.model_number.trim())
          .map((row) => row.model_number.trim());

        setUploadedFile(file);
        setModelNumbers(extractedModelNumbers);
      } else if (csvType === 'box_id') {
        const extractedBoxIds = data
          .filter((row) => row.box_id && row.box_id.trim())
          .map((row) => row.box_id.trim());

        setUploadedFile(file);
        setModelNumbers(extractedBoxIds);
      }
    } catch (error) {
      alert('Error parsing CSV: Please check the file format.');
      console.error('Critical parsing error:', error);
    }
  };

  // const CSV_HEADER = ['Serial Number','Quality Check','Packed','Quality Request Id', 'Box Id', 'Model Number', 'Batch Number' ];

  // const downloadCSV = (data) => {
  //   if (!Array.isArray(data) || data.length === 0 || !data[0].serial_number_data) {
  //     console.error("Data format is incorrect or missing serial_number_data.");
  //     return;
  //   }
  
  //   const csvRows = data.flatMap((record) =>
  //     record.serial_number_data.map((serial) => [
  //       `="${serial.serial_number}"`, 
  //       `="${serial.is_quality_checked}"`,
  //       `="${serial.is_packed}"`,
  //       `="${serial.quality_request_id}"`,
  //       `="${serial.packing_request_id}"`,
  //       record.model_number, 
  //       record.batch_number, 
  //     ])
  //   );
  
  //   const csvContent = [
  //     CSV_HEADER.join(','),
  //     ...csvRows.map((row) => row.join(',')), 
  //   ].join('\n');
  
  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.setAttribute('download', 'Product_box.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const generateCSV = async () => {
    if (modelNumbers.length > 0) {
      try {
        const idsString = modelNumbers.join(',');
        const endpoint = `${REPORTS_LISTING}/generatecsv?${csvType}=${idsString}`;

        const response = await ManageAPIsData(endpoint, 'GET');

        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          return;
        }

        const responseData = await response.json();

        if (responseData.data.length) {
          setApiData(responseData.data);
          enqueueSnackbar('Report Successfully Generated', { variant: 'success' });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        handleCloseUploadDialog();
      }
    } else {
      alert(`Please upload a CSV file with valid ${csvType === 'box_id' ? 'Box IDs' : 'Model Numbers'}.`);
    }
  };
  
  // const submitBoxIds = async () => {
  //   if (csvType === 'box_id' && modelNumbers.length > 0) {
  //     try {
  //       const boxIdsString = modelNumbers.join(',');
  //       const endpoint = `${REPORTS_LISTING}/csv?box_id=${boxIdsString}`;

  //       const response = await ManageAPIsData(endpoint, 'GET');

  //       if (!response.ok) {
  //         console.error("Error fetching data:", response.statusText);
  //         return;
  //       }

  //       const responseData = await response.json();

  //       if (responseData.data.length) {
  //         setApiData(responseData.data);
  //         // downloadCSV(responseData.data);
  //         generateCSV()
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       handleCloseUploadDialog(); 
  //     }
  //   } else {
  //     alert('Please upload a CSV file with valid Box IDs.');
  //   }
  // };

  // const submitModelnumber = async () => {
  //   if (csvType === 'model_number' && modelNumbers.length > 0) {
  //     try {
  //       const boxIdsString = modelNumbers.join(',');
  //       const endpoint = `${REPORTS_LISTING}/csv?model_number=${boxIdsString}`;

  //       const response = await ManageAPIsData(endpoint, 'GET');

  //       if (!response.ok) {
  //         console.error("Error fetching data:", response.statusText);
  //         return;
  //       }

  //       const responseData = await response.json();

  //       if (responseData.data.length) {
  //         setApiData(responseData.data);
  //         // downloadCSV(responseData.data);
  //         generateCSV()
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       handleCloseUploadDialog(); 
  //     }
  //   } else {
  //     alert('Please upload a CSV file with valid Box IDs.');
  //   }
  // };

  

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <TextField
          fullWidth
          value={filters.model_number}
          onChange={handleFilterModelNumber}
          placeholder="Model Number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:pricetags-outline" sx={{ color: 'text.primary' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          value={filters.packing_request_id}
          onChange={handleFilterBatchNumber}
          placeholder="Box ID"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:pricetags-outline" sx={{ color: 'text.primary' }} />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.batch_number}
            onChange={handleFilterName}
            placeholder="Search Batch number..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <Button
            variant="contained"
            onClick={() => handleOpenUploadDialog('model_number')}
            size="small"
          >
            Model Number CSV
          </Button>
          <Button variant="contained" onClick={() => handleOpenUploadDialog('box_id')} size="small">
            Box Id CSV
          </Button>
        </Stack>
      </Stack>

      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="md" fullWidth>
        <DialogTitle>Upload CSV</DialogTitle>
        <DialogContent>
          <Upload onDrop={HandleCSVFileChange} />
          {uploadedFile && <p>Uploaded file: {uploadedFile.name}</p>}

          <div>
            <h5>{csvType === 'model_number' ? 'Model Numbers' : 'Box IDs'}:</h5>
            <ul>
              {modelNumbers.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          {modelNumbers.length > 0 && (
          <Button variant="contained" color="primary"   onClick={generateCSV}>
          {csvType === 'box_id' ? 'Generate Box Ids' : 'Generate Model Numbers'}
          </Button>
              )}
        </DialogActions>
      </Dialog>
    </>
  );
}

OrderTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
