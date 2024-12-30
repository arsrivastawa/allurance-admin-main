// 'use client';

// import sumBy from 'lodash/sumBy';
// import { useState, useCallback, useEffect } from 'react';

// import Tab from '@mui/material/Tab';
// import Tabs from '@mui/material/Tabs';
// import Card from '@mui/material/Card';
// import Table from '@mui/material/Table';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import Divider from '@mui/material/Divider';
// import Tooltip from '@mui/material/Tooltip';
// import Container from '@mui/material/Container';
// import TableBody from '@mui/material/TableBody';
// import IconButton from '@mui/material/IconButton';
// import { alpha, useTheme } from '@mui/material/styles';
// import TableContainer from '@mui/material/TableContainer';

// import { paths } from 'src/routes/paths';
// import { useRouter } from 'src/routes/hooks';
// import { RouterLink } from 'src/routes/components';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { isAfter, isBetween } from 'src/utils/format-time';

// import { _invoices, INVOICE_SERVICE_OPTIONS } from 'src/_mock';

// import Label from 'src/components/label';
// import Iconify from 'src/components/iconify';
// import Scrollbar from 'src/components/scrollbar';
// import { useSnackbar } from 'src/components/snackbar';
// import { ConfirmDialog } from 'src/components/custom-dialog';
// import { useSettingsContext } from 'src/components/settings';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import {
//   useTable,
//   emptyRows,
//   TableNoData,
//   getComparator,
//   TableEmptyRows,
//   TableHeadCustom,
//   TableSelectedAction,
//   TablePaginationCustom,
// } from 'src/components/table';

// import InvoiceAnalytic from '../manage_request-analytic';
// import InvoiceTableRow from '../manage_request-table-row';
// import InvoiceTableToolbar from '../manage_request-table-toolbar';
// import InvoiceTableFiltersResult from '../manage_request-table-filters-result';

// import { MANAGEREQUEST_ENDPOINT } from '../../../utils/apiEndPoints';
// import { fetchDataFromApi } from '../../../utils/commonFunction';

// // ----------------------------------------------------------------------

// const TABLE_HEAD = [
//   { id: 'invoiceNumber', label: 'User Information' },

//   { id: 'dueDate', label: 'Request From' },
//   // { id: 'price', label: 'Amount' },
//   // { id: 'sent', label: 'Sent', align: 'center' },

//   { id: 'created_at', label: 'Date' },
//   { id: 'sent', label: 'View Information', align: 'center' },

//   { id: 'request_status', label: 'Status' },
//   { id: '' },
// ];

// const defaultFilters = {
//   name: '',
//   service: [],
//   status: 'all',
//   startDate: null,
//   endDate: null,
// };

// // ----------------------------------------------------------------------

// export default function InvoiceListView() {
//   const { enqueueSnackbar } = useSnackbar();

//   const theme = useTheme();

//   const settings = useSettingsContext();

//   const router = useRouter();

//   const table = useTable({ defaultOrderBy: 'createDate' });

//   const confirm = useBoolean();

//   const [tableData, setRequestTableData] = useState([]);

//   const [filters, setFilters] = useState(defaultFilters);

//   const dateError = isAfter(filters.startDate, filters.endDate);

//   // const [requestTableData, setRequestTableData] = useState([]);

//   const dataFiltered = applyFilter({
//     inputData: tableData,
//     comparator: getComparator(table.order, table.orderBy),
//     filters,
//     dateError,
//   });

//   const dataInPage = dataFiltered.slice(
//     table.page * table.rowsPerPage,
//     table.page * table.rowsPerPage + table.rowsPerPage
//   );

//   const denseHeight = table.dense ? 56 : 56 + 20;

//   const canReset =
//     !!filters.name ||
//     !!filters.service.length ||
//     filters.status !== 'all' ||
//     (!!filters.startDate && !!filters.endDate);

//   const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

//   const requestData = async () => {
//     try {
//       const apiUrl = MANAGEREQUEST_ENDPOINT;
//       const responseData = await fetchDataFromApi(apiUrl, 'GET');
//       if (responseData) {

//         setRequestTableData(responseData);
//       }
//     } catch (error) {
//       console.error("Error fetching designer data:", error);
//     }
//   };

//   useEffect(() => {
//     requestData();
//   }, []);

//   const getInvoiceLength = (status) => tableData.filter((item) => item.status === status).length;

//   const getTotalAmount = (status) =>
//     sumBy(
//       tableData.filter((item) => item.status === status),
//       'totalAmount'
//     );

//   const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

//   const TABS = [
//     { value: 'all', label: 'Pending', color: 'default', count: tableData.length },
//     {
//       value: 'paid',
//       label: 'Approved',
//       color: 'success',
//       count: getInvoiceLength('paid'),
//     },
//     {
//       value: 'overdue',
//       label: 'Rejected',
//       color: 'error',
//       count: getInvoiceLength('overdue'),
//     },
//     {
//       value: 'draft',
//       label: 'Timeout',
//       color: 'default',
//       count: getInvoiceLength('draft'),
//     },
//     {
//       value: 'pending',
//       label: 'All',
//       color: 'warning',
//       count: getInvoiceLength('pending'),
//     },
//   ];

//   const handleFilters = useCallback(
//     (name, value) => {
//       table.onResetPage();
//       setFilters((prevState) => ({
//         ...prevState,
//         [name]: value,
//       }));
//     },
//     [table]
//   );

//   const handleResetFilters = useCallback(() => {
//     setFilters(defaultFilters);
//   }, []);

//   const handleDeleteRow = useCallback(
//     (id) => {
//       const deleteRow = tableData.filter((row) => row.id !== id);

//       enqueueSnackbar('Delete success!');

//       setTableData(deleteRow);

//       table.onUpdatePageDeleteRow(dataInPage.length);
//     },
//     [dataInPage.length, enqueueSnackbar, table, tableData]
//   );

//   const handleDeleteRows = useCallback(() => {
//     const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

//     enqueueSnackbar('Delete success!');

//     setTableData(deleteRows);

//     table.onUpdatePageDeleteRows({
//       totalRowsInPage: dataInPage.length,
//       totalRowsFiltered: dataFiltered.length,
//     });
//   }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

//   const handleEditRow = useCallback(
//     (id) => {
//       router.push(paths.dashboard.manage_request.edit(id));
//     },
//     [router]
//   );

//   const handleViewRow = useCallback(
//     (id) => {
//       router.push(paths.dashboard.manage_request.details(id));
//     },
//     [router]
//   );

//   const handleFilterStatus = useCallback(
//     (event, newValue) => {
//       handleFilters('status', newValue);
//     },
//     [handleFilters]
//   );

//   return (
//     <>
//       <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//         <CustomBreadcrumbs
//           heading="Manage Request"
//           links={[
//             {
//               name: 'Dashboard',
//               href: paths.dashboard.root,
//             },
//             {
//               name: 'Manage Request',
//               href: paths.dashboard.manage_request.root,
//             },
//             {
//               name: 'List',
//             },
//           ]}
//           // action={
//           //   <Button
//           //     component={RouterLink}
//           //     href={paths.dashboard.manage_request.new}
//           //     variant="contained"
//           //     startIcon={<Iconify icon="mingcute:add-line" />}
//           //   >
//           //     New Request
//           //   </Button>
//           // }
//           sx={{
//             mb: { xs: 3, md: 5 },
//           }}
//         />

//         {/* <Card
//           sx={{
//             mb: { xs: 3, md: 5 },
//           }}
//         >
//           <Scrollbar>
//             <Stack
//               direction="row"
//               divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
//               sx={{ py: 2 }}
//             >
//               <InvoiceAnalytic
//                 title="Total"
//                 total={tableData.length}
//                 percent={100}
//                 price={sumBy(tableData, 'totalAmount')}
//                 icon="solar:bill-list-bold-duotone"
//                 color={theme.palette.info.main}
//               />

//               <InvoiceAnalytic
//                 title="Paid"
//                 total={getInvoiceLength('paid')}
//                 percent={getPercentByStatus('paid')}
//                 price={getTotalAmount('paid')}
//                 icon="solar:file-check-bold-duotone"
//                 color={theme.palette.success.main}
//               />

//               <InvoiceAnalytic
//                 title="Pending"
//                 total={getInvoiceLength('pending')}
//                 percent={getPercentByStatus('pending')}
//                 price={getTotalAmount('pending')}
//                 icon="solar:sort-by-time-bold-duotone"
//                 color={theme.palette.warning.main}
//               />

//               <InvoiceAnalytic
//                 title="Overdue"
//                 total={getInvoiceLength('overdue')}
//                 percent={getPercentByStatus('overdue')}
//                 price={getTotalAmount('overdue')}
//                 icon="solar:bell-bing-bold-duotone"
//                 color={theme.palette.error.main}
//               />

//               <InvoiceAnalytic
//                 title="Draft"
//                 total={getInvoiceLength('draft')}
//                 percent={getPercentByStatus('draft')}
//                 price={getTotalAmount('draft')}
//                 icon="solar:file-corrupted-bold-duotone"
//                 color={theme.palette.text.secondary}
//               />
//             </Stack>
//           </Scrollbar>
//         </Card> */}

//         <Card>
//           <Tabs
//             value={filters.status}
//             onChange={handleFilterStatus}
//             sx={{
//               px: 2.5,
//               boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
//             }}
//           >
//             {TABS.map((tab) => (
//               <Tab
//                 key={tab.value}
//                 value={tab.value}
//                 label={tab.label}
//                 iconPosition="end"
//                 icon={
//                   <Label
//                     variant={
//                       ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
//                     }
//                     color={tab.color}
//                   >
//                     {tab.count}
//                   </Label>
//                 }
//               />
//             ))}
//           </Tabs>

//           <InvoiceTableToolbar
//             filters={filters}
//             onFilters={handleFilters}
//             //
//             dateError={dateError}
//             serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
//           />

//           {canReset && (
//             <InvoiceTableFiltersResult
//               filters={filters}
//               onFilters={handleFilters}
//               //
//               onResetFilters={handleResetFilters}
//               //
//               results={dataFiltered.length}
//               sx={{ p: 2.5, pt: 0 }}
//             />
//           )}

//           <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
//             <TableSelectedAction
//               dense={table.dense}
//               numSelected={table.selected.length}
//               rowCount={dataFiltered.length}
//               onSelectAllRows={(checked) => {
//                 table.onSelectAllRows(
//                   checked,
//                   dataFiltered.map((row) => row.id)
//                 );
//               }}
//               action={
//                 <Stack direction="row">
//                   {/* <Tooltip title="Sent">
//                     <IconButton color="primary">
//                       <Iconify icon="iconamoon:send-fill" />
//                     </IconButton>
//                   </Tooltip>

//                   <Tooltip title="Download">
//                     <IconButton color="primary">
//                       <Iconify icon="eva:download-outline" />
//                     </IconButton>
//                   </Tooltip>

//                   <Tooltip title="Print">
//                     <IconButton color="primary">
//                       <Iconify icon="solar:printer-minimalistic-bold" />
//                     </IconButton>
//                   </Tooltip> */}

//                   <Tooltip title="Delete">
//                     <IconButton color="primary" onClick={confirm.onTrue}>
//                       <Iconify icon="solar:trash-bin-trash-bold" />
//                     </IconButton>
//                   </Tooltip>
//                 </Stack>
//               }
//             />

//             <Scrollbar>
//               <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
//                 <TableHeadCustom
//                   order={table.order}
//                   orderBy={table.orderBy}
//                   headLabel={TABLE_HEAD}
//                   rowCount={dataFiltered.length}
//                   numSelected={table.selected.length}
//                   onSort={table.onSort}
//                   onSelectAllRows={(checked) =>
//                     table.onSelectAllRows(
//                       checked,
//                       dataFiltered.map((row) => row.id)
//                     )
//                   }
//                 />

//                 <TableBody>
//                   {dataFiltered
//                     .slice(
//                       table.page * table.rowsPerPage,
//                       table.page * table.rowsPerPage + table.rowsPerPage
//                     )
//                     .map((row) => (
//                       <InvoiceTableRow
//                         key={row.id}
//                         row={row}
//                         selected={table.selected.includes(row.id)}
//                         onSelectRow={() => table.onSelectRow(row.id)}
//                         onViewRow={() => handleViewRow(row.id)}
//                         onEditRow={() => handleEditRow(row.id)}
//                         onDeleteRow={() => handleDeleteRow(row.id)}
//                       />
//                     ))}

//                   <TableEmptyRows
//                     height={denseHeight}
//                     emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
//                   />

//                   <TableNoData notFound={notFound} />
//                 </TableBody>
//               </Table>
//             </Scrollbar>
//           </TableContainer>

//           <TablePaginationCustom
//             count={dataFiltered.length}
//             page={table.page}
//             rowsPerPage={table.rowsPerPage}
//             onPageChange={table.onChangePage}
//             onRowsPerPageChange={table.onChangeRowsPerPage}
//             //
//             dense={table.dense}
//             onChangeDense={table.onChangeDense}
//           />
//         </Card>
//       </Container>

//       <ConfirmDialog
//         open={confirm.value}
//         onClose={confirm.onFalse}
//         title="Delete"
//         content={
//           <>
//             Are you sure want to delete <strong> {table.selected.length} </strong> items?
//           </>
//         }
//         action={
//           <Button
//             variant="contained"
//             color="error"
//             onClick={() => {
//               handleDeleteRows();
//               confirm.onFalse();
//             }}
//           >
//             Delete
//           </Button>
//         }
//       />
//     </>
//   );
// }

// // ----------------------------------------------------------------------

// function applyFilter({ inputData, comparator, filters, dateError }) {
//   const { name, status, service, startDate, endDate } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (invoice) =>
//         invoice.user_first_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         invoice.user_last_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         invoice.request_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         invoice.user_prefix_id.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         invoice.request_status.toLowerCase().indexOf(name.toLowerCase()) !== -1
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((invoice) => invoice.status === status);
//   }

//   if (service.length) {
//     inputData = inputData.filter((invoice) =>
//       typeof invoice.request_name === "string" && service.includes(invoice.request_name)
//     );
//   }

//   if (!dateError) {
//     if (startDate && endDate) {
//       inputData = inputData.filter((invoice) => isBetween(invoice.created_at, startDate, endDate));
//     }
//   }

//   return inputData;
// }

'use client';

import sumBy from 'lodash/sumBy';
import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';

import { _invoices, INVOICE_SERVICE_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import InvoiceAnalytic from '../manage_request-analytic';
import InvoiceTableRow from '../manage_request-table-row';
import InvoiceTableToolbar from '../manage_request-table-toolbar';
import InvoiceTableFiltersResult from '../manage_request-table-filters-result';

import { MANAGEREQUEST_ENDPOINT } from '../../../utils/apiEndPoints';
import { fetchDataFromApi, ManageAPIsDataWithHeader } from '../../../utils/commonFunction';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'invoiceNumber', label: 'User Information' },

  { id: 'dueDate', label: 'Request From' },
  // { id: 'price', label: 'Amount' },
  // { id: 'sent', label: 'Sent', align: 'center' },

  { id: 'created_at', label: 'Date' },
  { id: 'sent', label: 'View Information', align: 'center' },

  { id: 'request_status', label: 'Status' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'Pending',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();

  const [tableData, setRequestTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  // const [requestTableData, setRequestTableData] = useState([]);


  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
    selectedTab: filters.status,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset =
    !!filters.name ||
    !!filters.service.length ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // const requestData = async () => {
  //   try {
  //     const apiUrl = MANAGEREQUEST_ENDPOINT;
  //     const responseData = await fetchDataFromApi(apiUrl, 'GET');
  //     if (responseData) {
  //       setRequestTableData(responseData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching designer data:", error);
  //   }
  // };


  // Listing data
  const requestData = async () => {
    try {
      const fetchMethod = 'GET';
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(MANAGEREQUEST_ENDPOINT, fetchMethod, { headers });

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setRequestTableData(responseData.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  useEffect(() => {
    requestData();
  }, []);

  const getInvoiceLength = (status) => tableData.filter((item) => item.request_status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalAmount'
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

  // const TABS = [
  //   ...Object.entries(
  //     tableData.reduce((acc, curr) => {
  //       acc[curr.request_status] = acc[curr.request_status] ? acc[curr.request_status] + 1 : 1;
  //       return acc;
  //     }, {})
  //   ).map(([status, count]) => ({
  //     value: status,
  //     label: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize the status
  //     color: status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'default',
  //     count,
  //   })),
  //   {
  //     value: 'all',
  //     label: 'All',
  //     color: 'default',
  //     count: tableData.length,
  //   },
  //   // { value: 'pending', label: 'Pending', color: 'default', count: getInvoiceLength('pending')},
  //   // {
  //   //   value: 'paid',
  //   //   label: 'Approved',
  //   //   color: 'success',
  //   //   count: getInvoiceLength('paid'),
  //   // },
  //   // :  pending TABS show in status value   
  //   // {
  //   //   value: 'overdue',
  //   //   label: 'Rejected',
  //   //   color: 'error',
  //   //   count: getInvoiceLength('overdue'),
  //   // },
  //   // {
  //   //   value: 'draft',
  //   //   label: 'Timeout',
  //   //   color: 'default',
  //   //   count: getInvoiceLength('draft'),
  //   // },
  // ];


  const TABS = [
    { value: 'Pending', label: 'Pending', color: 'warning', count: getInvoiceLength('Pending') },
    { value: 'Approved', label: 'Approved', color: 'success', count: getInvoiceLength("Approved") },
    { value: 'Rejected', label: 'Rejected', color: 'error', count: getInvoiceLength("Rejected") },
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
  ];


  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);
  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_request.edit(id));
    },
    [router]
  );
  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_request.details(id));
    },
    [router]
  );
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Manage Request"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Manage Request',
              href: paths.dashboard.manage_request.root,
            },
            {
              name: 'List',
            },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
              action={
                <Stack direction="row">
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.user_first_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.user_last_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.request_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.user_prefix_id.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.request_status.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.request_status === status);
  }

  // if (status !== 'all') {

  //   let filterInvoicesByStatus
  //   if (status === "pending") {
  //     filterInvoicesByStatus = 1
  //   }
  //   if (status === "approved") {
  //     filterInvoicesByStatus = 2
  //   }
  //   if (status === "rejected") {
  //     filterInvoicesByStatus = 3
  //   }
  //   inputData = inputData.filter((invoice) => invoice.record_status === filterInvoicesByStatus);
  // }


  if (service.length) {
    inputData = inputData.filter((invoice) =>
      typeof invoice.request_name === "string" && service.includes(invoice.request_name)
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice) => isBetween(invoice.created_at, startDate, endDate));
    }
  }

  return inputData;
}