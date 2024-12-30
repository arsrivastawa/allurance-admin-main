// manage_design-list-oview.js
'use client';

import sumBy from 'lodash/sumBy';
import { useState, useCallback } from 'react';

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
import { useEffect } from 'react';

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
  TableHeadCustoms,
} from 'src/components/table';

import InvoiceAnalytic from '../warehouse-analytic';
import InvoiceTableRow from '../warehouse1-table-row';
import InvoiceTableToolbar from '../warehouse-table-toolbar';
import InvoiceTableFiltersResult from '../warehouse-table-filters-result';
import { DESIGNER_ENDPOINT, WARE, WAREHOUSE_ENDPOINT, WAREHOUSE_ENDPOINTHOUSE_ENDPOINT } from '../../../utils/apiEndPoints';
import { fetchDataFromApi, ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'category_name', label: 'Rack Name ' },
  { id: 'model_number', label: 'Rack Code ' },
  { id: 'created_at', label: 'Created at' },
  { id: 'count', label: 'Cartons Count' },
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

export default function InvoiceListView(permissions) {
  const { add_access, update_access, delete_access } = permissions.permissions

  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();



  const getListingData = async () => {
    try {
      const fetchMethod = 'GET';
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(WAREHOUSE_ENDPOINT, fetchMethod, { headers });

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setTableData(responseData.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getListingData();
  }, []);

  // const [tableData, setTableData] = useState(_invoices);
  const [tableData, setTableData] = useState([]); // Initialize with an empty array


  const [filters, setFilters] = useState(defaultFilters);

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

  const getInvoiceLength = (status) => tableData.filter((item) => item.marketing_product_record_status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalAmount'
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

  // const TABS = [
  //   { value: 'all', label: 'All', color: 'default', count: tableData.length },
  //   {
  //     value: 'paid',
  //     label: 'Approved',
  //     color: 'success',
  //     count: getInvoiceLength('paid'),
  //   },
  //   {
  //     value: 'pending',
  //     label: 'Pending',
  //     color: 'warning',
  //     count: getInvoiceLength('pending'),
  //   },
  //   {
  //     value: 'overdue',
  //     label: 'Rejected',
  //     color: 'error',
  //     count: getInvoiceLength('overdue'),
  //   },
  // ];

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    { value: 'pending creation', label: 'Pending Creation', color: 'info', count: getInvoiceLength(0) },
    { value: 'Requested', label: 'Requested', color: 'warning', count: getInvoiceLength(1) },
    { value: 'approved', label: 'Approved', color: 'success', count: getInvoiceLength(2) },
    { value: 'rejected', label: 'Rejected', color: 'error', count: getInvoiceLength(3) },
  ];

  // const handleFilters = useCallback(
  //   (name, value) => {

  //     table.onResetPage();
  //     setFilters((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   },
  //   [table]
  // );

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      // Check if the filter is for 'status' (tabs filter)
      if (name == 'status') {
        // Update the 'status' property of the filters object
        setFilters((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      }
      else {
        // For other filters, update the corresponding filter in the state
        setFilters((prevState) => ({
          ...prevState,
          name: value,
        }));
      }
    },
    [table]
  );

  // const handleFilters = useCallback((name, value) => {

  //   table.onResetPage();
  //   if (name != "") {
  //     // If the filter is for 'service', update the 'service' filter in the state
  //     setFilters((prevState) => ({
  //       ...prevState,
  //       name: value, // Update the 'service' filter with the selected value
  //     }));
  //   } else {
  //     // For other filters, update the corresponding filter in the state
  //     setFilters((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   }
  // }, [table]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id) => {

      const deleteRow = tableData.filter((row) => row.id !== id);

      const apiUrl = `${WAREHOUSE_ENDPOINT}/${id}`;
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
    const apiUrl = `${WAREHOUSE_ENDPOINT}/${deletedIds}`;
    const responseData = await fetchDataFromApi(apiUrl, 'DELETE');

    enqueueSnackbar('Delete success!');

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);


  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.warehouse.edit(id));
    },
    [router]
  );

  const handleAddRow = useCallback(
    (id) => {
      router.push(paths.dashboard.warehouse.new(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.warehouse.details(id));
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
          heading="Racks List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Warehouse',
              href: paths.dashboard.warehouse.root,
            },
            {
              name: 'Racks List',
            },
          ]}
          action={add_access === 1 && (
            <Button
              component={RouterLink}
              href={paths.dashboard.warehouse.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add New
            </Button>
          )}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {/* <Card
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, 'totalAmount')}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Paid"
                total={getInvoiceLength('paid')}
                percent={getPercentByStatus('paid')}
                price={getTotalAmount('paid')}
                icon="solar:file-check-bold-duotone"
                color={theme.palette.success.main}
              />

              <InvoiceAnalytic
                title="Pending"
                total={getInvoiceLength('pending')}
                percent={getPercentByStatus('pending')}
                price={getTotalAmount('pending')}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.palette.warning.main}
              />

              <InvoiceAnalytic
                title="Overdue"
                total={getInvoiceLength('overdue')}
                percent={getPercentByStatus('overdue')}
                price={getTotalAmount('overdue')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.palette.error.main}
              />

              <InvoiceAnalytic
                title="Draft"
                total={getInvoiceLength('draft')}
                percent={getPercentByStatus('draft')}
                price={getTotalAmount('draft')}
                icon="solar:file-corrupted-bold-duotone"
                color={theme.palette.text.secondary}
              />
            </Stack>
          </Scrollbar>
        </Card> */}

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
                        permissions={permissions.permissions}
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onAddRow={() => handleAddRow(row.id)}
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
        invoice.rack_title.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.rack_code.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    let filterInvoicesByStatus
    if (status === "Requested") {
      filterInvoicesByStatus = 1
    }
    if (status === "approved") {
      filterInvoicesByStatus = 2
    }
    if (status === "rejected") {
      filterInvoicesByStatus = 3
    }
    if (status === "pending creation") {
      filterInvoicesByStatus = 0
    }
    inputData = inputData.filter((invoice) => invoice.marketing_product_record_status === filterInvoicesByStatus);
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
