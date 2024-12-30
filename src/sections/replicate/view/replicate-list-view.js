// manage_design-list-oview.js
'use client';
import { useState, useCallback } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import { useEffect } from 'react';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { isAfter, isBetween } from 'src/utils/format-time';
import { _invoices, INVOICE_SERVICE_OPTIONS } from 'src/_mock';
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
  TableHeadCustoms,
} from 'src/components/table';

import InvoiceAnalytic from '../replicate-analytic';
import InvoiceTableRow from '../replicate1-table-row';
import InvoiceTableToolbar from '../replicate-table-toolbar';
import InvoiceTableFiltersResult from '../replicate-table-filters-result';
import { MY_REPLICATOR_BY_USERID, REPLICATOR_ENDPOINT } from '../../../utils/apiEndPoints';
import { fetchDataFromApi, ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
import { jwtDecode } from 'src/auth/context/jwt/utils';
// ----------------------------------------------------------------------

// TABLE HEADERS
const TABLE_HEAD = [
  { id: 'designer_id', label: 'Model Number' },
  { id: 'quantity', label: 'Quantity' },

  { id: 'created_at', label: 'Created On' },
  { id: 'sent', label: 'View Information', align: 'center' },
  { id: 'status', label: 'Status' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  // const [tableData, setTableData] = useState(_invoices);
  const [tableData, setTableData] = useState([]); // Initialize with an empty array

  const [filters, setFilters] = useState(defaultFilters);

  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();

  useEffect(() => {
    ReplicatorGetData();
  }, []);

  // API TO FETCH DATA  FROM SERVER
  const ReplicatorGetData = async () => {
    let fetchMethod = 'GET';
    const STORAGE_KEY = 'accessToken';
    let accessToken;
    // Check if sessionStorage is available before trying to access it
    if (typeof sessionStorage !== 'undefined') {
      accessToken = sessionStorage.getItem(STORAGE_KEY);
      // Check if accessToken is not undefined before decoding
    } else {
      console.error("sessionStorage is not available in this environment.");
    }
    let decoded;
    if (accessToken != null && accessToken !== undefined) {
      decoded = await jwtDecode(accessToken);
    } else {
      console.error("accessToken is undefined. Cannot decode.");
    }
    try {
      const apiUrl = `${MY_REPLICATOR_BY_USERID}/${decoded.data.id}`;
      let data = {}
      data.headers = { Authorization: `Bearer ${accessToken}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      const responseData = await response.json();
      if (responseData) {
        setTableData(responseData.data); // Set the response data to the tableData state
      }
    } catch (error) {
      console.error("Error fetching designer data:", error);
    }
  };

  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
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

  const getInvoiceLength = (status) => tableData.filter((item) => item.record_status === status).length;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    {
      value: 'Approved',
      label: 'Approved',
      color: 'success',
      count: getInvoiceLength(2),
    },
    {
      value: 'Rejected',
      label: 'Rejected',
      color: 'error',
      count: getInvoiceLength(3),
    },
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
    async (id) => {

      const deleteRow = tableData.filter((row) => row.id !== id);

      const apiUrl = `${REPLICATOR_ENDPOINT}?id=${id}`;
      const responseData = await fetchDataFromApi(apiUrl, 'DELETE');
      // if (responseData) { console.log("delete responseData", responseData); }

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {

    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    const deletedIds = table.selected.join(',');
    const apiUrl = `${REPLICATOR_ENDPOINT}?ids=${deletedIds}`;
    const responseData = await fetchDataFromApi(apiUrl, 'DELETE');

    enqueueSnackbar('Delete success!');

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_design.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.replicate.details(id));
    },
    [router]
  );
  const handleFilterStatus = useCallback(
    (event, newValue) => {

      handleFilters('status', newValue)
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="My Replicator"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'My Replicator',
              href: paths.dashboard.replicate.root,
            },
            {
              name: 'List',
            },
          ]}
          // action={
          //   <Button
          //     component={RouterLink}
          //     href={paths.dashboard.manage_design.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="mingcute:add-line" />}
          //   >
          //     New Replicate
          //   </Button>
          // }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card >
          {/* <Tabs
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
          </Tabs> */}

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
                  {/* <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip> */}

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
                <TableHeadCustoms
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
                        // onCreate={() => handleCreateReplication(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      // onDeleteRow={() => handleDeleteRow(row.id)}
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

// function applyFilter({ inputData, comparator, filters, dateError }) {
//   const { name, status, service, startDate, endDate, designer_id } = filters;

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
//         invoice.designer_id.toLowerCase().indexOf(name.toLowerCase()) !== -1
//       // invoice.quantity.toLowerCase().indexOf(name.toLowerCase()) !== -1
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((invoice) => invoice.status === status);
//   }

//   if (service.length) {
//     inputData = inputData.filter((invoice) =>
//       invoice.items.some((filterItem) => service.includes(filterItem.service))
//     );
//   }

//   if (!dateError) {
//     if (startDate && endDate) {
//       inputData = inputData.filter((invoice) => isBetween(invoice.created_at, startDate, endDate));
//     }
//   }

//   return inputData;
// }


function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate, designer_id, quantity } = filters;

  // const stabilizedThis = inputData.map((el, index) => [el, index]);
  const stabilizedThis = inputData ? inputData.map((el, index) => [el, index]) : [];


  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // if (name) {
  //   inputData = inputData.filter((invoice) => {
  //     // Check if designer_id is a string and contains the search query
  //     if (typeof invoice.designer_id === 'string') {
  //       return invoice.designer_id.toLowerCase().includes(name.toLowerCase());
  //     }
  //     // Check if designer_id is a number and convert it to string for comparison
  //     if (typeof invoice.designer_id === 'number') {
  //       return String(invoice.designer_id).includes(name.toLowerCase());
  //     }
  //     return false; // If designer_id is neither string nor number, exclude it
  //   });
  // }

  // if (name) {
  //   inputData = inputData.filter((invoice) => {
  //     // Check if designer_id is a string or number and contains the search query
  //     if (
  //       typeof invoice.designer_id === 'string' &&
  //       invoice.designer_id.toLowerCase().includes(name.toLowerCase())
  //     ) {
  //       return true;
  //     }
  //     if (
  //       typeof invoice.designer_id === 'number' &&
  //       String(invoice.designer_id).includes(name.toLowerCase())
  //     ) {
  //       return true;
  //     }
  //     // Check if quantity is a number and contains the search query
  //     if (
  //       typeof invoice.quantity === 'number' &&
  //       String(invoice.quantity).includes(name.toLowerCase())
  //     ) {
  //       return true;
  //     }
  //     return false; // If neither designer_id nor quantity match the search query, exclude it
  //   });
  // }

  if (name) {
    inputData = inputData.filter((invoice) => {
      // Check if designer_id is a string or number and contains the search query
      if (
        typeof invoice.designer_id === 'string' &&
        invoice.designer_id.toLowerCase().includes(name.toLowerCase())
      ) {
        return true;
      }
      if (
        typeof invoice.designer_id === 'number' &&
        String(invoice.designer_id).includes(name.toLowerCase())
      ) {
        return true;
      }
      // Check if quantity is a number and contains the search query
      if (
        typeof invoice.quantity === 'number' &&
        String(invoice.quantity).includes(name.toLowerCase())
      ) {
        return true;
      }
    });
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((filterItem) => service.includes(filterItem.service))
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice) => isBetween(invoice.created_at, startDate, endDate));
    }
  }

  return inputData;
}