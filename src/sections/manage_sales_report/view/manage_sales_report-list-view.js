'use client';

import { useState, useCallback, useEffect } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { isAfter, isBetween } from 'src/utils/format-time';
import { _invoices } from 'src/_mock';
import Scrollbar from 'src/components/scrollbar';
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
import InvoiceTableRow from '../manage_sales_report-table-row';
import InvoiceTableToolbar from '../manage_sales_report-table-toolbar';
import InvoiceTableFiltersResult from '../manage_sales_report-table-filters-result';
import { MANAGE_SALES_REPORTS } from '../../../utils/apiEndPoints';
import { ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
import { Grid } from '@mui/material';
import AppCurrentDownload from 'src/sections/overview/app/app-current-download';
import EcommerceYearlySales from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import BankingBalanceStatistics from 'src/sections/overview/banking/banking-balance-statistics';
import BookingStatistics from 'src/sections/overview/booking/booking-statistics';
import { useTheme } from '@emotion/react';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'order_id', label: 'Order Id' },
  { id: 'order_status', label: 'Order Status' },
  { id: 'payment_type', label: 'Payment Type' },
  { id: 'payment_status', label: 'Payment Status' },
  { id: 'channel_mode', label: 'Channel' },
  { id: 'invoice_date', label: 'Invoice Date' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  startDate: null,
  endDate: null,
  orderId: '',
  orderStatus: '',
  paymentType: '',
  paymentStatus: '',
  reportType: '',
  channelMode: '',
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createDate' });
  const [chartData, setChartData] = useState(null);
  const theme = useTheme();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
    selectedTab: filters.status,
  });

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : !!value
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const requestData = async () => {
    try {
      const response = await ManageAPIsDataWithHeader(MANAGE_SALES_REPORTS, 'POST');

      const responseData = await response.json();

      if (responseData.data) {
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    requestData();
  }, []);

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

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_request.details(id));
    },
    [router]
  );

  const modifiedData = tableData?.map((item) => ({
    ...item,
    channel_label: item.channel_mode === 1 ? 'Online' : 'Offline',
  }));

  const salesData = modifiedData.reduce((acc, item) => {
    const invoiceDate = new Date(item.invoice_date);
    const month = invoiceDate.getMonth();
    const year = invoiceDate.getFullYear();

    if (isNaN(year) || month === undefined) return acc;

    if (!acc[year])
      acc[year] = {
        Online: Array(12).fill(0),
        Offline: Array(12).fill(0),
        total: { Online: 0, Offline: 0 },
      };

    const totalAmount = parseFloat(item.total_amount) || 0;
    if (item.channel_label === 'Online') {
      acc[year]['Online'][month] += totalAmount;
      acc[year].total.Online += totalAmount;
    } else {
      acc[year]['Offline'][month] += totalAmount;
      acc[year].total.Offline += totalAmount;
    }

    return acc;
  }, {});

  const filteredSalesData = Object.keys(salesData).filter((year) => {
    const onlineSales = salesData[year].Online.reduce((sum, value) => sum + value, 0);
    const offlineSales = salesData[year].Offline.reduce((sum, value) => sum + value, 0);
    return filters.channelMode === 'Online'
      ? onlineSales > 0
      : filters.channelMode === 'Offline'
        ? offlineSales > 0
        : onlineSales > 0 || offlineSales > 0;
  });

  useEffect(() => {
    const chartData = {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      series: filteredSalesData.map((year) => {
        if (filters.channelMode === 'Online') {
          return {
            year,
            data: [{ name: 'Online Sales', data: salesData[year]['Online'] }],
          };
        } else if (filters.channelMode === 'Offline') {
          return {
            year,
            data: [{ name: 'Offline Sales', data: salesData[year]['Offline'] }],
          };
        } else {
          return {
            year,
            data: [
              { name: 'Online Sales', data: salesData[year]['Online'] },
              { name: 'Offline Sales', data: salesData[year]['Offline'] },
            ],
          };
        }
      }),
    };

    const timer = setTimeout(() => {
      setChartData(chartData);
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredSalesData, salesData, filters.channelMode]);



  // const [statisticsData, setStatisticsData] = useState({
  //   categories: [],
  //   series: [],
  // });

  // useEffect(() => {
  //   // Get the current date
  //   const currentDate = new Date();
  //   const currentYear = currentDate.getFullYear();
  //   const currentMonth = currentDate.getMonth(); // 0-11 (January is 0)
  //   const currentWeek = Math.ceil(currentDate.getDate() / 7); // Week of the current month

  //   // Generate the categories for weekly, monthly, and yearly data
  //   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  //   const weekCategories = ['Week 1', 'Week 2', 'Week 3', 'Week 4']; // Categories for weeks

  //   // Data for each week of the current month (you can expand this as needed)
  //   const weekData = [
  //     [10, 41, 35, 151, 49, 62, 69, 91, 48], // Sold data
  //     [10, 34, 13, 56, 77, 88, 99, 77, 45], // Canceled data
  //   ];

  //   // Full monthly data for all months (January to December)
  //   const monthData = [
  //     [148, 91, 69, 62, 49, 51, 35, 41, 10, 120, 98, 105], // Sold data (dummy data for Jan-Dec)
  //     [45, 77, 99, 88, 77, 56, 13, 34, 10, 30, 20, 40], // Canceled data (dummy data for Jan-Dec)
  //   ];

  //   // Full yearly data (January to December)
  //   const yearlyData = [
  //     [76, 42, 29, 41, 27, 138, 117, 86, 63, 95, 80, 99], // Sold data (dummy data for Jan-Dec)
  //     [80, 55, 34, 114, 80, 130, 15, 28, 55, 45, 30, 70], // Canceled data (dummy data for Jan-Dec)
  //   ];

  //   // Weekly series based on the current week
  //   const weeklySeries = [
  //     {
  //       name: 'Sold',
  //       data: weekData[0].slice(0, currentWeek), // Slice based on the current week
  //     },
  //     {
  //       name: 'Canceled',
  //       data: weekData[1].slice(0, currentWeek),
  //     },
  //   ];

  //   // Monthly series (full data for Jan-Dec)
  //   const monthlySeries = [
  //     {
  //       name: 'Sold',
  //       data: monthData[0], // Full data for Jan-Dec
  //     },
  //     {
  //       name: 'Canceled',
  //       data: monthData[1],
  //     },
  //   ];

  //   // Yearly series (full data for the year)
  //   const yearlySeries = [
  //     {
  //       name: 'Sold',
  //       data: yearlyData[0], // Complete data for the year (Jan-Dec)
  //     },
  //     {
  //       name: 'Canceled',
  //       data: yearlyData[1],
  //     },
  //   ];

  //   // Set the categories and series data for the chart
  //   setStatisticsData({
  //     categories: months, // Set months as categories for month and year charts
  //     series: [
  //       { type: 'Week', data: weeklySeries },
  //       { type: 'Month', data: monthlySeries },
  //       { type: 'Year', data: yearlySeries },
  //     ],
  //   });
  // }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Manage sales"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Manage Sales',
              href: paths.dashboard.manage_sales_report.root,
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
          <InvoiceTableToolbar filters={filters} onFilters={handleFilters} dateError={dateError} />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
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
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6} lg={6}>
            <AppCurrentDownload
              title="Sales Summary"
              chart={{
                series: [
                  {
                    label: 'Online Sales',
                    value: filteredSalesData.reduce(
                      (sum, year) => sum + salesData[year].total.Online,
                      0
                    ),
                  },
                  {
                    label: 'Offline Sales',
                    value: filteredSalesData.reduce(
                      (sum, year) => sum + salesData[year].total.Offline,
                      0
                    ),
                  },
                ],
                colors: ['#4CAF50', '#2196F3'],
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            {chartData && (
              <EcommerceYearlySales
                title="Yearly Sales"
                chart={{
                  ...chartData,
                  colors: ['#4CAF50', '#2196F3'],
                }}
              />
            )}
          </Grid>
        </Grid>
        {/* <BookingStatistics
      sx={{ mt: 3 }}
      title="Statistics"
      chart={{
        colors: [theme.palette.primary.main, theme.palette.error.light],
        categories: statisticsData.categories,
        series: statisticsData.series,
      }}
    /> */}
      </Container>
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
    paymentType,
    paymentStatus,
    reportType,
    channelMode,
  } = filters;

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

  if (paymentType) {
    filteredData = filteredData.filter((item) => item.payment_type === paymentType);
  }

  if (paymentStatus) {
    filteredData = filteredData.filter((item) => item.payment_status === paymentStatus);
  }

  if (reportType) {
    filteredData = filteredData.filter((item) => item.report_type === reportType);
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
