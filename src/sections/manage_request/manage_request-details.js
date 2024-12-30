import CustomPopover, { usePopover } from 'src/components/custom-popover';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { fDate, fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import LoadingButton from '@mui/lab/LoadingButton';
import { INVOICE_STATUS_OPTIONS } from 'src/_mock';
import { useSnackbar } from 'src/components/snackbar';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import Image from 'src/components/image';
import InvoiceToolbar from './manage_request-toolbar';
import * as Yup from 'yup';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { useForm } from 'react-hook-form';
import { paths } from 'src/routes/paths';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
// ----------------------------------------------------------------------
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { MANAGEREQUEST_ENDPOINT, DESIGNER_ENDPOINT, DESIGNER_APPROVED_ENDPOINT, DESIGNER_REJECTED_ENDPOINT, REPLICATOR_ENDPOINT, GIFT_CARD_ENDPOINT_FORFETCH, MARKETING_ENDPOINT, MY_MARKETING_ENDPOINT, CAMPAIGN_ENDPOINT, INE_ORDER_RETURN_ENDPOINT, MARKETING_FINAL_ENDPOINT } from '../../utils/apiEndPoints';
import { fetchDataFromApi, ManageAPIsData, ManageAPIsDataWithHeader, fetchFormatDate } from '../../utils/commonFunction';
import Iconify from 'src/components/iconify';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import * as XLSX from 'xlsx';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

// ----------------------------------------------------------------------

export default function InvoiceDetails({ rowID, open, onClose }) {
  const router = useRouter();
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const defaultDisplayCount = 5;
  const incrementCount = 10;
  const { enqueueSnackbar } = useSnackbar();
  const [displayCount, setDisplayCount] = useState(5);
  const handleShowMore = () => {
    setDisplayCount(displayCount + incrementCount);
  };
  const [tableManageRequestData, setManageRequestData] = useState([]);
  const [tableManageDesignData, setManageDesignData] = useState([]);
  const [approveButtonLabel, setApproveButtonLabel] = useState('Approve');
  const [recordLabel, setrecordLabel] = useState(1);
  const [ModuleData, setModuleData] = useState(null);
  const [Module_ID, setModule_ID] = useState(null);
  const [Userdata, SetUserdata] = useState(null);
  const [brandingFinalProduct, setBrandingFinalProduct] = useState([]);

  const NewProductSchema = Yup.object().shape({
    category_id: Yup.string().required('Category is required'),
    // manufacturing_piece: Yup.string().required('Manufacturing Pieces is required'),
    resin_id: Yup.string().required('Resin is required'),
    shape_id: Yup.string().required('Shape is required'),
    size_id: Yup.string().required('Size is required'),
    bezel_material_id: Yup.string().required('Bezel Material is required'),
    bezel_color_id: Yup.string().required('Bezel Color is required'),
    Inner_material_id: Yup.string().required('Inner Material is required'),
    flower_id: Yup.string().required('Flower is required'),
    color_id: Yup.string().required('Color is required'),
    title: Yup.string().required('Title is required'),
    in_pair: Yup.string().required('Pair selection is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: tableManageDesignData?.title || '',
      // manufacturing_piece: tableManageDesignData?.manufacturing_piece || '',
      category_id: tableManageDesignData?.category_id || '',
      resin_id: tableManageDesignData?.resin_id || '',
      shape_id: tableManageDesignData?.shape_id || '',
      size_id: tableManageDesignData?.size_id || '',
      bezel_material_id: tableManageDesignData?.bezel_material_id || '',
      bezel_color_id: tableManageDesignData?.bezel_color_id || '',
      Inner_material_id: tableManageDesignData?.Inner_material_id || '',
      flower_id: tableManageDesignData?.flower_id || '',
      color_id: tableManageDesignData?.color_id || '',
      image1: tableManageDesignData?.image1 || null,
      image2: tableManageDesignData?.image2 || null,
      image3: tableManageDesignData?.image3 || null,
      image4: tableManageDesignData?.image4 || null,
      image5: tableManageDesignData?.image5 || null,
      image6: tableManageDesignData?.image6 || null,
      in_pair: tableManageDesignData?.PairDetail || null,
    }),
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    if (!accessToken) {
      // console.error("accessToken is undefined. Cannot decode.");
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      const userdata = decoded?.data;
      if (userdata) {
        SetUserdata(userdata);
      } else {
        console.error("Role ID not found in decoded token.");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  useEffect(() => {
    manageRequestData();
  }, []);

  const manageRequestData = async () => {
    const token = await sessionStorage.getItem('accessToken');
    try {
      const apiUrl = `${MANAGEREQUEST_ENDPOINT}/${rowID}`;

      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      const mainresponse = await response.json();
      const responseData = await mainresponse.data
      if (responseData) {
        setModule_ID(responseData[0]?.module_id);
        setManageRequestData(responseData[0]);
        const moduleID = await responseData[0]?.module_id;
        let moduleData;
        switch (moduleID) {
          case 15:
            moduleData = await manageDesignData(responseData[0]?.row_id);
            break;
          case 17:
            moduleData = await FetchGiftCard(responseData[0]?.row_id);
            break;
          case 18:
            moduleData = await FetchDatafromReplicator(responseData[0]?.row_id);
            break;
          case 94:
            moduleData = await FetchDatafromMarketing(responseData[0]?.row_id);
            await FetchDatafromMarketingProduct(rowID);
            break;
          case 98:
            moduleData = await FetchDatafromCampaign(responseData[0]?.row_id);
            break;
          case 114:
            moduleData = await FetchDatafromOrderReturn(responseData[0]?.row_id);
            break;
          default:
            moduleData = null; // Handle the case where moduleID is not recognized
            break;
        }
        setModuleData(moduleData);
      }
    } catch (error) {
      console.error("Error fetching designer data:", error);
    }
  };

  // DOWNLOAD SECTOIN
  const handleExportCSV = () => {
    const mainObjectData = {
      model_no: ModuleData.designer_id,
      quantity: ModuleData.quantity,
      batch_number: ModuleData.batch_number,
      rejection_reason: ModuleData.rejection_reason
    };

    const approvedRecordsData = ModuleData?.approvedrecords?.map(record => ({
      batch_number: ModuleData.batch_number,
      pair: record.pair == 2 ? 'No' : 'Yes',
      serial_number: record.serial_number ? `="${record.serial_number}"` : '',
      serial_number_left: record.serial_number_left ? `="${record.serial_number_left}"` : '',
      serial_number_right: record.serial_number_right ? `="${record.serial_number_right}"` : ''
    }));

    // Combining main object data and approved records data
    const csvData = [Object.keys(mainObjectData), Object.values(mainObjectData)];
    if (approvedRecordsData?.length > 0) {
      csvData.push(Object.keys(approvedRecordsData[0]));
      csvData.push(...approvedRecordsData.map(record => Object.values(record)));
    }

    // Formatting CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    // Creating Blob
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Generating download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Replication_data.csv';

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSVGiftcard = () => {
    // Extracting data from the main object
    const mainObjectData = {
      Type: ModuleData.type === 1 ? "Multiple Business Giftcard" :
        ModuleData.type === 2 ? "Multiple People Giftcard" :
          ModuleData.type === 3 ? "Single Giftcard" : "N/A",
      Name: ModuleData.name,
      "Company Name": ModuleData.company_name,
      Email: ModuleData.email
    };

    // Extracting data from the 'Rows' array
    const rowsData = ModuleData?.Rows?.map(item => ({
      "Gift Card Amount": item?.value,
      "Gift Card Count": item?.multiplication
    })) || [];

    // Combining main object data and rows data
    const csvData = [Object.keys(mainObjectData), Object.values(mainObjectData)];
    if (rowsData.length > 0) {
      csvData.push(Object.keys(rowsData[0]));
      csvData.push(...rowsData.map(row => Object.values(row)));
    }

    // Formatting CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    // Creating Blob
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Generating download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'giftcard_data.csv';

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSVProduct = () => {
    // Extracting data from the product object
    const productObjectData = {
      "Model Number": ModuleData.model_number,
      "Product Name": ModuleData.title,
      "Base Price": ModuleData.base_price,
      "Retail Price": ModuleData.retail_price,
      "Bulk Price": ModuleData.bulk_price,
      "Weight": ModuleData.weight,
      "Description": ModuleData.description,
      "Collection": ModuleData.collection,
    };

    // Formatting the CSV data
    const csvData = [Object.keys(productObjectData), Object.values(productObjectData)];

    // Formatting CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    // Creating Blob
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Generating download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ModuleData.title}_Details.csv`;

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcelProduct = () => {
    const productObjectData = {
      "Model Number": ModuleData.model_number,
      "Product Name": ModuleData.title,
      "Base Price": ModuleData.base_price,
      "Retail Price": ModuleData.retail_price,
      "Bulk Price": ModuleData.bulk_price,
      "Weight": ModuleData.weight,
      "Description": ModuleData.description,
      "Collection": ModuleData.collection,
    };

    // Formatting the data for Excel
    const excelData = [productObjectData];

    // Creating a new workbook
    const workbook = XLSX.utils.book_new();

    // Converting data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Adding worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

    // Saving the workbook as an Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Creating Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Generating download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ModuleData.title}_Details.xlsx`;

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const mainObjectData = {
      quantity: ModuleData.quantity,
      batch_number: ModuleData.batch_number,
      rejection_reason: ModuleData.rejection_reason
    };

    // Extracting data from the 'approvedrecords' array
    const approvedRecordsData = ModuleData?.approvedrecords?.map(record => ({
      batch_number: ModuleData.batch_number,
      pair: record.pair == 2 ? 'No' : 'Yes',
      serial_number: record.serial_number ? `\t${record.serial_number}` : '',
      serial_number_left: record.serial_number_left ? `\t${record.serial_number_left}` : '',
      serial_number_right: record.serial_number_right ? `\t${record.serial_number_right}` : ''
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add main object data to a worksheet
    const mainObjectWorksheet = XLSX.utils.json_to_sheet([mainObjectData]);
    XLSX.utils.book_append_sheet(workbook, mainObjectWorksheet, 'Main Data');

    // Add approved records data to a worksheet, if available
    if (approvedRecordsData && approvedRecordsData.length > 0) {
      const approvedRecordsWorksheet = XLSX.utils.json_to_sheet(approvedRecordsData);
      XLSX.utils.book_append_sheet(workbook, approvedRecordsWorksheet, 'Approved Records');
    }

    // Generate a blob from the workbook
    const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    const url = URL.createObjectURL(new Blob([excelBlob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Replication_data.xlsx';

    // Triggering download
    a.click();

    // Cleaning up
    URL.revokeObjectURL(url);
  };


  const handleExportExcelGiftcard = () => {
    // Extracting data from the main object
    const mainObjectData = {
      Type: ModuleData.type === 1 ? "Multiple Business Giftcard" :
        ModuleData.type === 2 ? "Multiple People Giftcard" :
          ModuleData.type === 3 ? "Single Giftcard" : "N/A",
      Name: ModuleData.name,
      "Company Name": ModuleData.company_name,
      Email: ModuleData.email
    };

    // Extracting data from the 'Rows' array
    const rowsData = ModuleData?.Rows?.map(item => ({
      "Gift Card Amount": item?.value,
      "Gift Card Count": item?.multiplication
    })) || [];

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add main object data to a worksheet
    const mainObjectWorksheet = XLSX.utils.json_to_sheet([mainObjectData]);
    XLSX.utils.book_append_sheet(workbook, mainObjectWorksheet, 'Main Object Data');

    // Add rows data to a worksheet
    const rowsWorksheet = XLSX.utils.json_to_sheet(rowsData);
    XLSX.utils.book_append_sheet(workbook, rowsWorksheet, 'Counted Giftcards');

    // Generate a blob from the workbook
    const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Creating download link
    const url = window.URL.createObjectURL(new Blob([excelBlob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'giftcard_data.xlsx';

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSVCampaign = () => {
    // Extracting data from the campaign object
    const campaignObjectData = {
      "Campaign Name": ModuleData.campaign_name,
      "Start Date": fDate(ModuleData.start_date),
      "End Date": fDate(ModuleData.till_date),
      "Redemption Numbers": ModuleData.number_of_redemptions,
      "Redemptions Per Person": ModuleData.number_of_redemptions_single_user,
      "Discount (%)": ModuleData.discount_percentage,
      "Minimum Cart Price": ModuleData.min_cart_value,
      "Minimum Cart Products": ModuleData.min_cart_products,
      "Max Discount In Price": ModuleData.max_discount_in_price,
      "Show in Section": ModuleData.show_in_section === 1 ? "No" : "Yes",
      "First Order Only": ModuleData.first_order_validity === 1 ? "No" : "Yes",
      "Coupon Code": ModuleData.coupon_code,
    };

    // Formatting the CSV data
    const csvData = [Object.keys(campaignObjectData), Object.values(campaignObjectData)];

    // Formatting CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    // Creating Blob
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Generating download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ModuleData.campaign_name}_Details.csv`;

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcelCampaign = () => {
    // Extracting data from the campaign object
    const campaignObjectData = {
      "Campaign Name": ModuleData.campaign_name,
      "Start Date": fDate(ModuleData.start_date),
      "End Date": fDate(ModuleData.till_date),
      "Redemption Numbers": ModuleData.number_of_redemptions,
      "Redemptions Per Person": ModuleData.number_of_redemptions_single_user,
      "Discount (%)": ModuleData.discount_percentage,
      "Minimum Cart Price": ModuleData.min_cart_value,
      "Minimum Cart Products": ModuleData.min_cart_products,
      "Max Discount In Price": ModuleData.max_discount_in_price,
      "Show in Section": ModuleData.show_in_section === 1 ? "No" : "Yes",
      "First Order Only": ModuleData.first_order_validity === 1 ? "No" : "Yes",
      "Coupon Code": ModuleData.coupon_code,
    };

    // Formatting the data for Excel
    const excelData = [campaignObjectData];

    // Creating a new workbook
    const workbook = XLSX.utils.book_new();

    // Converting data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Adding worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaign Data");

    // Saving the workbook as an Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Creating Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Generating download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ModuleData.campaign_name}_Details.xlsx`;

    // Triggering download
    a.click();

    // Cleaning up
    window.URL.revokeObjectURL(url);
  };

  // MODULE DECLARATION
  let DesignData;
  let GiftcardTable;
  let marketingTable;
  let replicatorTable;
  let campaignTable;
  let orderReturnTable;

  if (ModuleData) {
    switch (Module_ID) {
      case 15:
        DesignData = (
          <>
            <FormProvider methods={methods} onSubmit={""}>
              <Stack sx={{ typography: 'body2' }} md={12} xl={12}>
                <Stack sx={{ typography: 'body2' }} md={6} xl={6}>
                  {/* <RHFTextField
                    name="Title"
                    value={tableManageRequestData?.request_name}
                    label=""
                    disabled
                    sx={{ mb: 1 }}
                  /> */}
                  {/* <RHFTextField
                  name="Request From"
                  value={tableManageRequestData?.request_name}
                  label=""
                  disabled
                  sx={{ mb: 1 }}
                /> */}
                  {tableManageDesignData.category_name && (
                    <>
                      <RHFTextField
                        name="title"
                        value={tableManageDesignData?.title}
                        label="Title"
                        disabled
                        sx={{ mb: 1 }}
                      />
                      <RHFTextField
                        name="Resin Name"
                        value={tableManageDesignData.resin_name}
                        label="Resin Name"
                        disabled
                        sx={{ mb: 1 }}
                      />
                      <RHFTextField
                        name="Shape Type"
                        value={tableManageDesignData.shape_sequence_number}
                        label="Shape Type"
                        disabled
                        sx={{ mb: 1 }}
                      />
                    </>
                  )}
                </Stack>
                <Stack sx={{ typography: 'body2' }} md={6} xl={6}>
                  {/* Additional fields for Request Information */}
                  {tableManageDesignData.category_name && (
                    <>
                      <RHFTextField
                        name="Bezel Material"
                        value={tableManageDesignData.bezel_material_name}
                        label="Bezel Material"
                        disabled
                        sx={{ mb: 1 }}
                      />
                      <RHFTextField
                        name="Bezel Color"
                        value={tableManageDesignData.bezel_color_name}
                        label="Bezel Color"
                        disabled
                        sx={{ mb: 1 }}
                      />
                      <RHFTextField
                        name="Inner Material"
                        value={tableManageDesignData.Inner_material_name}
                        label="Inner Material"
                        disabled
                        sx={{ mb: 1 }}
                      />
                      <RHFTextField
                        name="Color"
                        value={tableManageDesignData.color_name}
                        label="Color"
                        disabled
                        sx={{ mb: 1 }}
                      />
                      <RHFTextField
                        name="Size"
                        value={tableManageDesignData?.isfs_length + " X " + tableManageDesignData?.isfs_breadth}
                        label="Size"
                        disabled
                        sx={{ mb: 1 }}
                      />
                    </>
                  )}
                </Stack>
              </Stack>
            </FormProvider>
            {(tableManageDesignData.image1 || tableManageDesignData.image2 || tableManageDesignData.image3 || tableManageDesignData.image4 || tableManageDesignData.image5 || tableManageDesignData.image6) ? (
              <>
                <Typography variant="subtitle2">
                  Uploaded Images
                </Typography>
                {tableManageDesignData.image1 && (
                  <Image
                    alt={tableManageDesignData.image1}
                    src={`${tableManageDesignData.image1}`}
                    style={{ width: 100, height: 100 }}
                    sx={{
                      borderRadius: 2,
                      my: {
                        xs: 5,
                        md: 2,
                      },
                      mr: 2,
                    }}
                  />
                )}
                {tableManageDesignData.image2 && (
                  <Image
                    alt={tableManageDesignData.image2}
                    src={`${tableManageDesignData.image2}`}
                    style={{ width: 100, height: 100 }}
                    sx={{
                      borderRadius: 2,
                      my: {
                        xs: 5,
                        md: 2,
                      },
                      mr: 2,
                    }}
                  />
                )}
                {tableManageDesignData.image3 && (
                  <Image
                    alt={tableManageDesignData.image3}
                    src={`${tableManageDesignData.image3}`}
                    style={{ width: 100, height: 100 }}
                    sx={{
                      borderRadius: 2,
                      my: {
                        xs: 5,
                        md: 2,
                      },
                      mr: 2,
                    }}
                  />
                )}
                {tableManageDesignData.image4 && (
                  <Image
                    alt={tableManageDesignData.image4}
                    src={`${tableManageDesignData.image4}`}
                    style={{ width: 100, height: 100 }}
                    sx={{
                      borderRadius: 2,
                      my: {
                        xs: 5,
                        md: 2,
                      },
                      mr: 2,
                    }}
                  />
                )}
                {tableManageDesignData.image5 && (
                  <Image
                    alt={tableManageDesignData.image5}
                    src={`${tableManageDesignData.image5}`}
                    style={{ width: 100, height: 100 }}
                    sx={{
                      borderRadius: 2,
                      my: {
                        xs: 5,
                        md: 2,
                      },
                      mr: 2,
                    }}
                  />
                )}
                {tableManageDesignData.image6 && (
                  <Image
                    alt={tableManageDesignData.image6}
                    src={`${tableManageDesignData.image6}`}
                    style={{ width: 100, height: 100 }}
                    sx={{
                      borderRadius: 2,
                      my: {
                        xs: 5,
                        md: 2,
                      },
                      mr: 2,
                    }}
                  />
                )}
              </>
            ) : (
              <Typography variant="subtitle2">
                No images uploaded
              </Typography>
            )}

          </>
        );
        break;
      case 17:
        GiftcardTable = (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>ID</TableCell> */}
                  <TableCell>Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Download</TableCell>
                  {/* <TableCell>Giftcard Amount</TableCell> */}
                  {/* <TableCell>Total Giftcards</TableCell> */}
                  {/* <TableCell>Total Amount</TableCell> */}
                  {/* <TableCell>Record Status</TableCell> */}

                  {/* Add more headers if needed */}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* <TableCell>{ModuleData.id}</TableCell> */}
                  <TableCell>
                    {ModuleData.type === 1 ? "Multiple Business Giftcard" :
                      ModuleData.type === 2 ? "Multiple People Giftcard" :
                        ModuleData.type === 3 ? "Single Giftcard" : "N/A"}
                  </TableCell>
                  <TableCell>{ModuleData.name}</TableCell>
                  <TableCell>{ModuleData.company_name}</TableCell>
                  <TableCell>{ModuleData.email}</TableCell>
                  <TableCell>{ModuleData.total_amount}</TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div onClick={handleExportCSVGiftcard} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                        CSV
                      </div>
                      /
                      <div onClick={handleExportExcelGiftcard} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                        Excel
                      </div>
                    </div>
                  </TableCell>

                  {/* <TableCell>{ModuleData.value}</TableCell> */}
                  {/* <TableCell>{ModuleData.total_giftcard}</TableCell> */}
                  {/* <TableCell>{ModuleData.total_amount}</TableCell> */}
                  {/* <TableCell>{ModuleData.record_status}</TableCell> */}

                  {/* Render other properties as needed */}
                </TableRow>
              </TableBody>
            </Table>

            <Table sx={{
              my: {
                xs: 5,
                md: 2,
              },
              mr: 2,
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Gift Card Amount</TableCell>
                  <TableCell>Gift Card Count</TableCell>
                  {/* <TableCell>ecord Status</TableCell> */}

                  {/* Add more headers if needed */}
                </TableRow>
              </TableHead>
              <TableBody>
                {ModuleData?.Rows?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item?.denomination}</TableCell>
                    <TableCell>{item?.multiplication}</TableCell>
                  </TableRow>
                ))}
              </TableBody >
            </Table >
            <Table sx={{
              my: {
                xs: 5,
                md: 2,
              },
              mr: 2,
            }}>
              <TableHead>
                <TableRow>
                  {Userdata.id == 1 && (
                    <TableCell>Pin Number</TableCell>
                  )}
                  <TableCell>Gift Card Number</TableCell>
                  <TableCell>Gift Card Amount</TableCell>
                  <TableCell>Redeemed Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  {/* <TableCell>ecord Status</TableCell> */}

                  {/* Add more headers if needed */}
                </TableRow>
              </TableHead>
              <TableBody>
                {ModuleData?.giftcards?.slice(0, displayCount).map((item) => (
                  <TableRow key={item.id}>
                    {Userdata.id === 1 && (
                      <TableCell>{item?.pin_number}</TableCell>
                    )}
                    <TableCell>{item?.gift_card_number}</TableCell>
                    <TableCell>{item?.amount}</TableCell>
                    <TableCell>{fDateTime(item?.redeemed_date) || "N/A"}</TableCell>
                    <TableCell>{fDateTime(item?.expiry_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {ModuleData?.giftcards?.length > displayCount && (
              <Button onClick={handleShowMore}>Show more ...</Button>
            )}
          </>
        );
        break;
      case 18:
        replicatorTable = (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>ID</TableCell> */}
                  {ModuleData.batch_number ? <TableCell>batch Number</TableCell> : ""}
                  <TableCell>Model Number</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Record Status</TableCell>
                  <TableCell>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* <TableCell>{ModuleData.id}</TableCell> */}
                  {ModuleData.batch_number ? <TableCell>{ModuleData.batch_number}</TableCell> : ""}
                  <TableCell>{ModuleData.designer_id}</TableCell>
                  <TableCell>{ModuleData.quantity}</TableCell>
                  <TableCell>
                    {ModuleData.record_status == 1 ? (
                      <Label variant="soft" color="warning">Pending</Label>
                    ) : ModuleData.record_status == 2 ? (
                      <Label variant="soft" color="success">Approved</Label>
                    ) : ModuleData.record_status == 3 ? (
                      <Label variant="soft" color="error">Rejected</Label>
                    ) : null}</TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div onClick={handleExportCSV} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                        CSV
                      </div>
                      /
                      <div onClick={handleExportExcel} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                        Excel
                      </div>
                    </div>
                  </TableCell>
                  {/* Render other properties as needed */}
                </TableRow>
              </TableBody>
            </Table >
            {
              ModuleData.approvedrecords ?
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch Number </TableCell>
                      <TableCell>Serial Number </TableCell>
                      <TableCell>Left Serial Number </TableCell>
                      <TableCell>Right Serial Number </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ModuleData.approvedrecords && ModuleData.approvedrecords.length > 0 && ModuleData.approvedrecords.map((item) => {
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{ModuleData.batch_number}</TableCell>
                          <TableCell>{item.serial_number || "N/A"}</TableCell>
                          <TableCell>{item.serial_number_left || "N/A"}</TableCell>
                          <TableCell>{item.serial_number_right || "N/A"}</TableCell>
                          {/* Render other properties as needed */}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table >
                : ""
            }

          </>
        );
        break;
      case 94:
        marketingTable = (
          <>

            <Stack sx={{
              my: {
                xs: 5,
                md: 2,
              },
              mr: 2,
            }}> Final Product</Stack>

            <div>
              <Table style={{ background: '#253649', marginBottom: '10px' }}>
                <TableHead>
                  <TableRow>
                    {/* <TableCell>Model Number </TableCell> */}
                    <TableCell>Product Name</TableCell>
                    <TableCell>Base Price</TableCell>
                    <TableCell>Retail Price</TableCell>
                    <TableCell>Bulk Price</TableCell>
                    <TableCell>Weight</TableCell>
                    {/* <TableCell>Download</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {/* <TableCell>{brandingFinalProduct[0]?.model_number}</TableCell> */}
                    <TableCell>{brandingFinalProduct[0].title}</TableCell>
                    <TableCell>{brandingFinalProduct[0].base_price}</TableCell>
                    <TableCell>{brandingFinalProduct[0].retail_price}</TableCell>
                    <TableCell>{brandingFinalProduct[0].bulk_price}</TableCell>
                    <TableCell>{brandingFinalProduct[0].weight}</TableCell>
                    {/* <TableCell>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div onClick={handleExportCSVProduct} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                          CSV
                        </div>
                        /
                        <div onClick={handleExportExcelProduct} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                          Excel
                        </div>
                      </div>
                    </TableCell> */}
                  </TableRow>
                </TableBody>
                {brandingFinalProduct[0]?.description && (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7}>Description: {brandingFinalProduct[0].description}</TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {brandingFinalProduct[0].images && brandingFinalProduct[0].images.length > 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Stack sx={{ typography: 'body2' }}>
                          <Typography variant="subtitle2" sx={{ mb: 3 }}>
                            Uploaded Images
                          </Typography>
                          <Box display="flex">
                            {brandingFinalProduct[0].images && brandingFinalProduct[0].images.map((image, index) => (
                              <Image
                                key={index}
                                alt={`Image ${index + 1}`}
                                src={`` + image}
                                style={{
                                  width: 50, height: 50, marginRight: 2, marginBottom: 2, borderRadius: 2
                                }}
                              // onClick={() => handleOpenLightbox(image)}
                              />
                            ))}
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {brandingFinalProduct[0].videos && (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7}>
                        < Stack sx={{ typography: 'body2' }}>
                          <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)', mt: 2 }}>
                            Uploaded Videos
                          </Typography>
                          <Box display="flex">
                            {brandingFinalProduct[0].videos && brandingFinalProduct[0].videos.map((video, index) => (
                              <video
                                key={index}
                                alt={`Video ${index + 1}`}
                                src={`` + video}
                                style={{
                                  width: 200, height: 100, marginRight: 2, marginBottom: 2, borderRadius: 2
                                }}
                              />
                            ))}
                          </Box>
                        </Stack >
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </div>

            <Stack sx={{
              my: {
                xs: 5,
                md: 2,
              },
              mr: 2,
            }}> Product Edit History</Stack>

            {ModuleData && ModuleData.length > 0 && ModuleData.map((item) => (
              <div>
                <Table key={item.id} style={{ background: '#253649', marginBottom: '10px' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model Number </TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Base Price</TableCell>
                      <TableCell>Retail Price</TableCell>
                      <TableCell>Bulk Price</TableCell>
                      <TableCell>Weight</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{item.model_number}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.base_price}</TableCell>
                      <TableCell>{item.retail_price}</TableCell>
                      <TableCell>{item.bulk_price}</TableCell>
                      <TableCell>{item.weight}</TableCell>
                    </TableRow>
                  </TableBody>
                  {item?.description && (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7}>Description: {item.description}</TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7}>Status:
                        {item.status == 1 ? (
                          <Label variant="soft" color="success">Approved</Label>
                        ) : item.status == 2 ? (
                          <Label variant="soft" color="warning">Pending</Label>
                        ) : item.status == 3 ? (
                          <Label variant="soft" color="error">Rejected</Label>
                        ) : null} | Created: {fetchFormatDate(item.created_at)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  {item.images && item.images.length > 0 && (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Stack sx={{ typography: 'body2' }}>
                            <Typography variant="subtitle2" sx={{ mb: 3 }}>
                              Uploaded Images
                            </Typography>
                            <Box display="flex">
                              {item.images && item.images.map((image, index) => (
                                <Image
                                  key={index}
                                  alt={`Image ${index + 1}`}
                                  src={`` + image}
                                  style={{
                                    width: 50, height: 50, marginRight: 2, marginBottom: 2, borderRadius: 2
                                  }}
                                // onClick={() => handleOpenLightbox(image)}
                                />
                              ))}
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                  {item.videos && (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7}>
                          < Stack sx={{ typography: 'body2' }}>
                            <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)', mt: 2 }}>
                              Uploaded Videos
                            </Typography>
                            <Box display="flex">
                              {item.videos && item.videos.map((video, index) => (
                                <video
                                  key={index}
                                  alt={`Video ${index + 1}`}
                                  src={`` + video}
                                  style={{
                                    width: 200, height: 100, marginRight: 2, marginBottom: 2, borderRadius: 2
                                  }}
                                />
                              ))}
                            </Box>
                          </Stack >
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </div>
            ))}

          </>
        );
        break;
      case 98:
        campaignTable = (
          <>
            <Stack sx={{
              my: {
                xs: 5,
                md: 2,
              },
              mr: 2,
            }}> Campaign Details</Stack>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* <TableCell>ID</TableCell> */}
                    <TableCell>Campaign Name</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>No of Valid Redemption</TableCell>
                    <TableCell>Number Of Redeemed</TableCell>
                    <TableCell>Minimunn Cart Price</TableCell>
                    <TableCell>Channel mode</TableCell>
                    {/* <TableCell>max Discount In Price</TableCell> */}
                    {/* <TableCell>Show in Section</TableCell>
                    <TableCell>First Order Only</TableCell> */}
                    {/* <TableCell>Coupon Code</TableCell>
                    <TableCell>Download</TableCell> */}
                    {/* <TableCell>Giftcard Amount</TableCell> */}
                    {/* <TableCell>Total Giftcards</TableCell> */}
                    {/* <TableCell>Total Amount</TableCell> */}
                    {/* <TableCell>Record Status</TableCell> */}

                    {/* Add more headers if needed */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {/* <TableCell>{ModuleData.id}</TableCell> */}
                    <TableCell>{ModuleData.name}</TableCell>
                    <TableCell>{fDate(ModuleData.start_date)}</TableCell>
                    <TableCell>{fDate(ModuleData.end_date)}</TableCell>
                    <TableCell>{ModuleData.no_of_valid_redemptions}</TableCell>
                    <TableCell>{ModuleData.no_of_redeemed}</TableCell>
                    <TableCell>{ModuleData.min_cart_value}</TableCell>
                    <TableCell> {ModuleData?.channel_mode === 1
                ? 'Online'
                : ModuleData?.channel_mode === 2
                  ? 'Offline'
                  : ModuleData?.channel_mode === 3
                    ? 'Both'
                    : '--'}</TableCell>
                    {/* <TableCell>{ModuleData.max_discount_in_price}</TableCell> */}
                    {/* <TableCell>{ModuleData.show_in_section = 1 ? "No " : "Yes"}</TableCell>
                    <TableCell>{ModuleData.first_order_validity = 1 ? "No " : "Yes"}</TableCell> */}
                    {/* <TableCell>{ModuleData?.coupons[0]?.coupon_code}</TableCell> */}
                    {/* <TableCell>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div onClick={handleExportCSVCampaign} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                          CSV
                        </div>
                        /
                        <div onClick={handleExportExcelCampaign} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="solar:import-bold" style={{ marginRight: '5px' }} />
                          Excel
                        </div>
                      </div>
                    </TableCell> */}
                    {/* <TableCell>{ModuleData.value}</TableCell> */}
                    {/* <TableCell>{ModuleData.total_giftcard}</TableCell> */}
                    {/* <TableCell>{ModuleData.total_amount}</TableCell> */}
                    {/* <TableCell>{ModuleData.record_status}</TableCell> */}

                    {/* Render other properties as needed */}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <Stack variant="subtitle2" sx={{ mb: 1, mt: 1, fontSize: 'calc(1rem + 1px)' }}>
           { ModuleData?.unique_code_for_all_customer === 2 &&(
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                Coupon Code :-  {ModuleData?.coupons[0]?.coupon_code}
              </Typography>
              )}
               <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                Categories :-  {ModuleData?.categoryNameResults}
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                Product Name :-  {ModuleData?.productNameResults}
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                Description :-  {ModuleData?.description}
              </Typography>
            </Stack >
            <Stack direction="column" alignItems="flex-start" sx={{ mt: 1 }}>
              {/* <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                Uploaded Campaign URL :
              </Typography> */}
              <Stack direction="row" alignItems="center" spacing={1}>
                {/* <Button variant="contained" size="small" onClick={copyToClipboard}>Copy</Button> */}
                <Typography variant="body1" sx={{ mb: 1, fontSize: 'calc(1rem + 1px)' }}>
                  {ModuleData?.campaign_url}
                </Typography>
              </Stack>
            </Stack>
          </>
        );
        break;
      case 114:
        orderReturnTable = (
          <>
            <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
            <Stack>
              <Typography variant="h5" gutterBottom>
                Order Details
              </Typography>
              <Typography variant="body1">
                ID: {ModuleData.order.id}
              </Typography>
              <Typography variant="body1">
                Serial Number: {ModuleData.order.serial_number}
              </Typography>
              <Typography variant="body1">
                Channel Mode: {ModuleData.order.channel_mode}
              </Typography>
              {/* Add more order details here */}
            </Stack>
            <Divider sx={{ mt: 2, mb: 2, borderStyle: 'dashed' }} />
            <Stack>
              <Typography variant="h5" gutterBottom>
                Return Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr no.</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Refund Amount</TableCell>
                      {/* Add more table headers if needed */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ModuleData.returns.map((returnItem, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{returnItem.serial_number}</TableCell>
                        <TableCell>{returnItem.refund_amount}</TableCell>
                        {/* Add more cells for additional return details */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
            {/* Render images associated with the order */}
            {ModuleData.order.image_1 && (
              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                  Uploaded Images
                </Typography>
                <Box display="flex">
                  {[1, 2, 3, 4, 5].map((index) => {
                    const imagePath = ModuleData.order[`image_${index}`];
                    return imagePath && (
                      <Image
                        key={index}
                        alt={`Image ${index}`}
                        src={`${imagePath}`}
                        style={{
                          width: 100, height: 100, marginRight: 2, marginBottom: 2, borderRadius: 2
                        }}
                      />
                    );
                  })}
                </Box>
              </Stack>
            )}
          </>
        );
        break;

        GiftcardTable = null; // Handle the case where module_id is not recognized
        replicatorTable = null; // Handle the case where module_id is not recognized
        campaignTable = null;
        break;
    }
  }

  // APIS TO FETCH FROM THE MODULES 

  // FUNCTION TO FETCH GIFT CARD DATA  FROM THE SERVER ------------------------------
  async function FetchGiftCard(ID) {
    try {
      const apiUrl = `${GIFT_CARD_ENDPOINT_FORFETCH}/${ID}`;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      // const mainresponse = await response.json();
      // const responseData = await mainresponse.data
      // const response = await ManageAPIsData(apiUrl, 'GET');

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (Object.keys(responseData).length) { // setcurrentInvoice(responseData.data);

        return responseData.data
      }
      return false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // FUNCTION TO FETCH REPLCICATOR DATA  DATA  FROM THE SERVER ------------------------------
  async function FetchDatafromReplicator(ID) {
    try {
      const token = await sessionStorage.getItem('accessToken');
      const apiUrl = `${REPLICATOR_ENDPOINT}?id=${ID}`;
      // const response = await ManageAPIsData(apiUrl, 'GET');
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (Object.keys(responseData).length) {
        return responseData.data;
        // return responseData.data[0];

        // setcurrentInvoice(responseData.data);
      }
      return false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // FUNCTION TO FETCH MARKETING DATA  DATA  FROM THE SERVER ------------------------------
  async function FetchDatafromMarketing(ID) {
    try {
      const token = await sessionStorage.getItem('accessToken');
      const apiUrl = `${MY_MARKETING_ENDPOINT}/${ID}`;
      // const response = await ManageAPIsData(apiUrl, 'GET');
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      console.log("responseDataresponseDataresponseData", responseData);
      if (Object.keys(responseData).length) {
        return responseData.data;

        // setcurrentInvoice(responseData.data);
      }
      return false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // Final Product
  async function FetchDatafromMarketingProduct(ID) {
    try {
      const apiUrl = `${MARKETING_FINAL_ENDPOINT}/${ID}`;
      const response = await ManageAPIsData(apiUrl, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (Object.keys(responseData).length) {
        setBrandingFinalProduct(responseData.data);
      }
      return false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // FUNCTION TO FETCH CAMPAIGN DATA  DATA  FROM THE SERVER ------------------------------
  async function FetchDatafromCampaign(ID) {
    try {
      const token = await sessionStorage.getItem('accessToken');
      const apiUrl = `${CAMPAIGN_ENDPOINT}?id=${ID}`;
      // const response = await ManageAPIsData(apiUrl, 'GET');
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (Object.keys(responseData).length) {
        return responseData.data;

        // setcurrentInvoice(responseData.data);
      }
      return false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // FUNCTION TO FETCH ORDER RETURN DATA  DATA  FROM THE SERVER ------------------------------
  async function FetchDatafromOrderReturn(ID) {
    try {
      const token = await sessionStorage.getItem('accessToken');
      const apiUrl = `${INE_ORDER_RETURN_ENDPOINT}?id=${ID}`;
      // const response = await ManageAPIsData(apiUrl, 'GET');
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (Object.keys(responseData).length) {
        return responseData.data;
        // setcurrentInvoice(responseData.data);
      }
      return false;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const manageDesignData = async (requestID) => {
    try {
      const apiUrl = `${DESIGNER_ENDPOINT}/${requestID}`;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      let data = {};
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
      const mainresponse = await response.json();
      const responseData = await mainresponse.data
      // const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setManageDesignData(responseData);
        return responseData
      }
    } catch (error) {
      console.error("Error fetching designer data:", error);
    }
  };

  // Comment Form
  const CommentSchema = Yup.object().shape({
    comments: Yup.string().required('Comment is required'),
  });

  const commentForm = useForm({
    resolver: yupResolver(CommentSchema),
  });

  const {
    reset: resetCommentForm,
    handleSubmit: handleSubmitCommentForm,
    formState: { isSubmitting: isSubmittingCommentForm },
    setValue: setCommentValue,
  } = commentForm;

  useEffect(() => {
    if (tableManageRequestData) {
      setCommentValue('comments', tableManageRequestData?.comments || '');
    }
  }, [tableManageRequestData, setCommentValue]);

  const onSubmitComment = handleSubmitCommentForm(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      resetCommentForm();

      const apiUrl = `${MANAGEREQUEST_ENDPOINT}/${rowID}`;
      const fetchMethod = "PUT";
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      // const response = await ManageAPIsData(apiUrl, fetchMethod, data);
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      if (response.ok) {
        enqueueSnackbar('Update success!');
        manageRequestData();
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }

    } catch (err) {
      console.error(err.message);
    }
  });

  // Reject Form
  const handleRejectClick = () => {
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };

  const RejectionSchema = Yup.object().shape({
    rejection_reason: Yup.string().required('Rejection Reason is required'),
  });

  const rejectionForm = useForm({
    resolver: yupResolver(RejectionSchema),
  });

  const {
    reset: resetRejectionForm,
    handleSubmit: handleSubmitRejectionForm,
    formState: { isSubmitting: isSubmittingRejectionForm },
    setValue: setRejectionValue,
  } = rejectionForm;

  useEffect(() => {
    if (tableManageDesignData) {
      setrecordLabel(tableManageDesignData?.record_status);
      setRejectionValue('rejection_reason', tableManageDesignData?.rejection_reason || '');
      if (tableManageDesignData.record_status === 2) {
        setApproveButtonLabel('Approved');
      }
    }
  }, [tableManageDesignData, setRejectionValue]);

  const onSubmitRejection = handleSubmitRejectionForm(async (data) => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    if (!accessToken) {
      console.error("accessToken is undefined. Cannot decode.");
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      const roleid = decoded?.data?.role_id;
      var data = { rejection_reason: data.rejection_reason, record_status: 3, rowID: tableManageRequestData?.row_id, moduleId: tableManageRequestData?.module_id, roleid: roleid }
      try {
        // data.record_status = 3;
        // data.rowID = rowID;

        await new Promise((resolve) => setTimeout(resolve, 500));
        // resetRejectionForm();
        const token = await sessionStorage.getItem('accessToken');
        if (!token) {
          console.error("Token is undefined.");
          return;
        }
        const apiUrl = `${DESIGNER_REJECTED_ENDPOINT}/${rowID}`;
        const fetchMethod = "PUT";
        // const response = await ManageAPIsData(apiUrl, fetchMethod, data);
        data.headers = { Authorization: `Bearer ${token}` }
        const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
        if (response.ok) {
          enqueueSnackbar('Update success!');
          handleCloseRejectDialog();
          setApproveButtonLabel('Approve');
          setrecordLabel(3);
          router.push(paths.dashboard.manage_request.root);
        } else {
          const responseData = await response.json();
          if (responseData && responseData.error) {
            enqueueSnackbar(responseData.error, { variant: 'error' });
          }
        }

      } catch (err) {
        console.error(err.message);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  });

  // Approve Form
  const handleApproveClick = async () => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    if (!accessToken) {
      console.error("accessToken is undefined. Cannot decode.");
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      const roleid = decoded?.data?.role_id;
      const apihitid = decoded?.data?.id;
      setApproveButtonLabel('Approved')
      var data = { record_status: 2, rowID: tableManageRequestData?.row_id, moduleId: tableManageRequestData?.module_id, roleid: roleid, apihitid: apihitid }
      const apiUrl = `${DESIGNER_APPROVED_ENDPOINT}/${rowID}`;
      const fetchMethod = "PUT";
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      // const response = await ManageAPIsData(apiUrl, fetchMethod, data);
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      if (response.ok) {
        enqueueSnackbar('Update success!');
        setRejectionValue('rejection_reason', '');
        setrecordLabel(2);
        router.push(paths.dashboard.manage_request.root);
      } else {
        const responseData = await response;
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };


  return (
    <>
      <Grid xs={12} md={12}>
        <Card sx={{ p: 3 }}>
          <Box
            component="img"
            alt="logo"
            src="/logo/Allurance_Logo.svg"
          // sx={{ width: 100, height: 100, 'visibility': 'Hidden' }}
          />
          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            {tableManageRequestData.request_status === "Pending" && (
              <Label
                variant="soft"
                color="warning"
              >
                Pending
              </Label>
            )}
            {tableManageRequestData.request_status === "Approved" && (
              <Label
                variant="soft"
                color="success"
              >
                Approved
              </Label>
            )}
            {tableManageRequestData.request_status === "Rejected" && (
              <Label
                variant="soft"
                color="error"
              >
                Rejected
              </Label>
            )}

            <Typography variant="h6">User ID : {tableManageRequestData.user_prefix_id}</Typography>
            {tableManageRequestData.id && (<Typography variant="h6">Request ID : REQ0{tableManageRequestData.id}</Typography>)}
            <Typography variant="h6">Request Date : {fDateTime(tableManageRequestData?.created_at)}</Typography>
            <Typography variant="h6">
              Request For : {
                tableManageRequestData?.module_id === 17 ? "Creation of Giftcard" :
                  tableManageRequestData?.module_id === 18 ? "New Replication" :
                    tableManageRequestData?.module_id === 15 ? "Design Creation" :
                      tableManageRequestData?.module_id === 94 ? <>{ModuleData?.create ? "Create " || ModuleData?.create ? "Update " : "" : ""}Marketing Product</> :
                        tableManageRequestData?.module_id === 98 ? "Campaign" :
                          tableManageRequestData?.module_id === 114 ? "Order Return" :
                            ""
              }
            </Typography>
            {tableManageDesignData.model_number ? <Typography variant="h6">Model Number: {tableManageDesignData.model_number ? tableManageDesignData.model_number : ""}</Typography> : ""}
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              User Information
            </Typography>
            {/* Display User Information */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>Name: {tableManageRequestData.user_first_name} {tableManageRequestData.user_last_name}</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>Email: {tableManageRequestData.user_email}</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>User ID: {tableManageRequestData.user_prefix_id}</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>Gender: {tableManageRequestData.user_gender === 1 ? 'Male' : 'Female'}</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>Address: {tableManageRequestData.user_address}, {tableManageRequestData.user_statename}, {tableManageRequestData.user_districtname}, {tableManageRequestData.user_pincode}</Typography>
            <Typography variant="body2">Phone: +91 {tableManageRequestData.user_phone}</Typography>
          </Stack>
          <Typography variant="subtitle1" sx={{
            mt: 2, mb: 2,
          }}>
            Request Information
          </Typography>
          {/* Form Provider for Request Information */}

          <br />
          {DesignData}
          {replicatorTable}
          {GiftcardTable}
          {marketingTable}
          {campaignTable}
          {orderReturnTable}
          <br />


          <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />

          <FormProvider methods={commentForm} onSubmit={onSubmitComment}>
            <Stack spacing={3}>
              <RHFTextField
                name="comments"
                placeholder="Write some of your comments..."
                multiline
                rows={4}
              />
              <Stack direction="row" sx={{ mb: 5 }} alignItems="center">
                <LoadingButton type="submit" variant="contained" loading={isSubmittingCommentForm}>
                  Comment
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
          {tableManageRequestData?.request_status != 'Approved' && tableManageRequestData?.request_status != 'Rejected' ?
            <Button
              color="success"
              sx={{
                mr: 1,
                mt: 5,
                mb: 5,
                backgroundColor: approveButtonLabel === 'Approved' ? '#0854088c' : '', // Change 'green' to the desired color
              }}
              alignItems="center"
              variant="outlined"
              size="medium"
              onClick={handleApproveClick}
            >
              {approveButtonLabel}
            </Button> : ""}
          {tableManageRequestData?.request_status === 'Approved' && tableManageRequestData?.request_status !== 'Rejected' && (
            <Stack
              color="success"
              sx={{
                p: 1,
                mr: 1,
                mt: 5,
                mb: 5,
                backgroundColor: '#0854088c', // Green color for approval
              }}
              alignItems="center"
              variant="outlined"
              size="medium"
            >
              This Request was Approved by {tableManageRequestData.updated_user_id !== Userdata.id ?
                `${tableManageRequestData.updated_user_prefix_id} ${tableManageRequestData.updated_user_first_name}` :
                "You"} ({tableManageRequestData.updated_user_prefix_id}) At {fDateTime(tableManageRequestData?.updated_at)}
            </Stack>
          )}
          {tableManageRequestData?.request_status !== 'Approved' && tableManageRequestData?.request_status === 'Rejected' && (
            <Stack
              color="error"
              sx={{
                p: 1,
                mr: 1,
                mt: 5,
                mb: 5,
                backgroundColor: '#8b0000ad', // Red color for rejection
              }}
              alignItems="center"
              variant="outlined"
              size="medium"
            >
              This Request was Rejected by {tableManageRequestData.updated_user_id !== Userdata.id ?
                `${tableManageRequestData.updated_user_prefix_id} ${tableManageRequestData.updated_user_first_name}` :
                (tableManageRequestData?.updated_user_first_name || "")} ({tableManageRequestData?.updated_user_prefix_id}) At {fDateTime(tableManageRequestData?.updated_at)}
            </Stack>
          )}



          {tableManageRequestData?.request_status != 'Approved' && tableManageRequestData?.request_status != 'Rejected' ?
            <Button
              sx={{ mb: 5, mr: 1, mt: 5 }} alignItems="center"
              color="error"

              variant="outlined"
              size="medium"
              onClick={handleRejectClick}  // Add this line to open the Reject dialog
            >
              Reject
            </Button>
            : ""}
        </Card>
      </Grid>

      <Dialog
        fullWidth
        maxWidth={false}
        // open={open}
        // onClose={onClose}
        open={openRejectDialog}  // Use the state variable to conditionally open/close the dialog
        onClose={handleCloseRejectDialog}

        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <FormProvider methods={rejectionForm} onSubmit={onSubmitRejection}>
          <DialogTitle>Rejection</DialogTitle>
          <DialogContent>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
              <RHFTextField name="rejection_reason" label="Write reason ..." />
            </Box>
          </DialogContent>
          <DialogActions>
            <LoadingButton type="submit" variant="contained" loading={isSubmittingRejectionForm}>
              Update
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );


}

InvoiceDetails.propTypes = {
  rowID: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
