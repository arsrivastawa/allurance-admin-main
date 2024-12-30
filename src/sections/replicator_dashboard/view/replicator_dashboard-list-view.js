'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
import {
  DESIGNER_DASHBOARD_CARD_DATA,
  DESIGNER_DASHBOARD_RECORDS,
  REPLICATOR_DASHBOARD_CARD_DATA,
  REPLICATOR_DASHBOARD_RECORDS,
  SIZEFORSHAPE_ENDPOINT,
} from '../../../utils/apiEndPoints';
import ProductTableFiltersResult from '../replicator_dashboard-table-filters-result';
import {
  RenderCellShape,
  RenderCellSequenceNumber,
  RenderCellProduct,
  RenderCellCreatedAt,
  RenderCellProductCode,
} from '../replicator_dashboard-table-row';
import { Grid, Typography, useTheme } from '@mui/material';
import AppWidgetSummary from 'src/sections/overview/app/app-widget-summary';
import AppCurrentDownload from 'src/sections/overview/app/app-current-download';
import AppAreaInstalled from 'src/sections/overview/app/app-area-installed';

// ----------------------------------------------------------------------

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function ProductListView(permissions) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();
  const settings = useSettingsContext();
  const [tableData, setTableData] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  // Listing data
  const getListingData = async () => {
    try {
      const fetchMethod = 'POST';

      const response = await ManageAPIsDataWithHeader(REPLICATOR_DASHBOARD_RECORDS, fetchMethod);

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

  const getCardData = async () => {
    try {
      const fetchMethod = 'POST';

      const response = await ManageAPIsDataWithHeader(REPLICATOR_DASHBOARD_CARD_DATA, fetchMethod);

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }
      const responseData = await response.json();

      if (responseData.data) {
        setCardData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getCardData();
    getListingData();
  }, []);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      filterable: false,
    },
    {
      field: 'designer_name',
      headerName: 'Designer Name',
      flex: 1,
      minWidth: 120,
      hideable: false,
      renderCell: (params) => <RenderCellShape params={params} />,
    },
    {
      field: 'batch_number',
      headerName: 'Batch Number',
      flex: 1,
      minWidth: 120,
      hideable: false,
      renderCell: (params) => <RenderCellSequenceNumber params={params} />,
    },
    {
      field: 'is_packed',
      headerName: 'Is Packed',
      flex: 1,
      minWidth: 120,
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 1,
      minWidth: 120,
      hideable: false,
      renderCell: (params) => <RenderCellProductCode params={params} />,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h3">Replicator Dashboard</Typography>
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="Total Count"
              total={tableData?.length}
              chart={{
                series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
              }}
            />
          </Grid>
          {/* 
          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="Total Products"
              total="436"
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="Total Blogs"
              total="578"
              chart={{
                colors: [theme.palette.warning.light, theme.palette.warning.main],
                series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
              }}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentDownload
              title="Current Download"
              chart={{
                series: [
                  { label: 'Mac', value: 12244 },
                  { label: 'Window', value: 53345 },
                  { label: 'iOS', value: 44313 },
                  { label: 'Android', value: 78343 },
                ],
              }}
            />
          </Grid>
          <Grid item  xs={12} md={6} lg={8}>
            <AppAreaInstalled
              title="Area Installed"
              subheader="(+43%) than last year"
              chart={{
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
                series: [
                  {
                    year: '2019',
                    data: [
                      {
                        name: 'Asia',
                        data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                      },
                      {
                        name: 'America',
                        data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                      },
                    ],
                  },
                  {
                    year: '2020',
                    data: [
                      {
                        name: 'Asia',
                        data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                      },
                      {
                        name: 'America',
                        data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                      },
                    ],
                  },
                ],
              }}
            />
          </Grid> */}
        </Grid>

        <Card
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            mt: 3,
          }}
        >
          <DataGrid
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={false}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: () => (
                <>
                  <GridToolbarContainer>
                    <GridToolbarQuickFilter />
                    <Stack
                      spacing={1}
                      flexGrow={1}
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarExport />
                    </Stack>
                  </GridToolbarContainer>

                  {canReset && (
                    <ProductTableFiltersResult
                      filters={filters}
                      onFilters={handleFilters}
                      onResetFilters={handleResetFilters}
                      results={dataFiltered.length}
                      sx={{ p: 2.5, pt: 0 }}
                    />
                  )}
                </>
              ),
              noRowsOverlay: () => <EmptyContent title="No Data" />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              columnsPanel: {
                getTogglableColumns,
              },
            }}
          />
        </Card>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}
