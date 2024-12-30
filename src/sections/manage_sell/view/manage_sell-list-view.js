'use client';

import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';

import { _orders } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableSelectedAction,
  TablePaginationCustom,
  TableHeadCustoms,
} from 'src/components/table';

import OrderTableRow from '../manage_sell-table-row';
import OrderTableToolbar from '../manage_sell-table-toolbar';
import OrderTableFiltersResult from '../manage_sell-table-filters-result';
import { MANAGE_SELL } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'orderNumber', label: 'Order' },
  { id: 'user_first_name', label: 'Customer' },
  { id: 'invoice_date', label: 'Invoice Date' },
  { id: 'channel', label: 'Channel', width: 140 },
  { id: 'totalAmount', label: 'Price', width: 140 },
  { id: 'status', label: 'Order Status', width: 140 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  orderId: '',
  orderStatus: '',
  channelMode: '',
};

// ----------------------------------------------------------------------

export default function OrderListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  // Listing data
  const getListingData = async () => {
    try {
      const response = await ManageAPIsData(MANAGE_SELL, 'POST');

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getListingData();
  }, []);

  const getInvoiceLength = (status) =>
    tableData.filter((item) => item.channel_mode === status).length;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    { value: 'Online', label: 'Online', color: 'warning', count: getInvoiceLength(1) },
    { value: 'Offline', label: 'Offline', color: 'error', count: getInvoiceLength(2) },
  ];

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

  const canReset = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : !!value
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (key, value) => {
      table.onResetPage();
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    setFilters(defaultFilters);
  }, [table]);

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

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_sell.details(id));
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
        {/* <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Order',
              href: paths.dashboard.order.root,
            },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        /> */}

        <Card>

          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
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
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                      <OrderTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
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
  const {
    startDate,
    endDate,
    orderId,
    orderStatus,
    channelMode,
  } = filters;

  // Stabilize and sort data
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (orderId) {
    filteredData = filteredData.filter((item) =>
      item.order_id.toLowerCase().includes(orderId.toLowerCase())
    );
  }

  if (orderStatus) {
    filteredData = filteredData.filter((item) => item.order_status === orderStatus);
  }

  if (channelMode) {
    filteredData = filteredData.filter((item) => item.channel_mode === channelMode);
  }

  if (!dateError && startDate && endDate) {
    filteredData = filteredData.filter((item) =>
      isBetween(new Date(item.created_at), startDate, endDate)
    );
  }

  return filteredData;
}
