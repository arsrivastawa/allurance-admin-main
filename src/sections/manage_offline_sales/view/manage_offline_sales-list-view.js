'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {
  DataGrid,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
import { MANAGE_OFFLINE_SALES_LISTING } from '../../../utils/apiEndPoints';
import ProductTableFiltersResult from '../manage_offline_sales-table-filters-result';
import {
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
  RenderCellProductCode,
  RenderCellStock,
} from '../manage_offline_sales-table-row';
import Cookies from 'js-cookie';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Offline Sales List',
};

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
  const { add_access, update_access, delete_access } = permissions.permissions;

  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  // const { products, productsLoading } = useGetProducts();

  const [tableData, setTableData] = useState([]);
  console.log(tableData,"DATA")

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  // Listing data
  const getListingData = async () => {
    try {
      const response = await ManageAPIsDataWithHeader(MANAGE_OFFLINE_SALES_LISTING, 'POST');

      const responseData = await response.json();

      if (responseData.data) {
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
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

 const handleEditRow = useCallback(
  (id) => {
    // Find the corresponding row data
    const rowData = tableData.find((row) => row.request_id === id);
    if (rowData) {
      router.push(paths.dashboard.manage_offline_sales.step2);
      Cookies.set('request_id', rowData.request_id, { expires: 1 });
      console.log(rowData.request_id, "HELLO");
    } else {
      console.error("Row data not found for id:", id);
    }
  },
  [router, tableData]
);

  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      filterable: false,
    },
    {
      field: 'order_id',
      headerName: 'Order Id',
      flex: 1,
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'invoice_id',
      headerName: 'Invoice Id',
      flex: 1,
      hideable: false,
      renderCell: (params) => <RenderCellProductCode params={params} />,
    },
    {
      field: 'invoice_date',
      headerName: 'Invoice Date',
      flex: 1,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      field: 'sales_first_name',
      headerName: 'Sales First Name',
      flex: 1,
      renderCell: (params) => <RenderCellStock params={params} />,
    },
    {
      field: 'total_amount',
      headerName: 'Total Amount',
      width: 110,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      getActions: (params) => {
        const actions = [];
        {
          update_access === 1 &&
            actions.push(
              <GridActionsCellItem
                key="edit"
                showInMenu
                icon={<Iconify icon="solar:pen-bold" />}
                label="Edit"
                onClick={() => handleEditRow(params.row.request_id)}
              />
            );
        }
        return actions;
      },
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
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Offline Sales',
              href: paths.dashboard.manage_offline_sales.root,
            },
            { name: 'List' },
          ]}
          action={
            add_access === 1 && (
              <Button
                component={RouterLink}
                href={paths.dashboard.manage_offline_sales.step1}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add New
              </Button>
            )
          }
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Card
          sx={{
            height: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DataGrid
            // checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            getRowId={(row) => row.request_id}
            columns={columns}
            loading={false}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
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
