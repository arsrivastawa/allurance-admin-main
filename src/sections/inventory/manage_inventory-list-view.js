'use client';
import { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import isEqual from 'lodash/isEqual';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import EmptyContent from 'src/components/empty-content';
import {
  _ecommerceBestSalesman,
  _ecommerceLatestProducts,
} from 'src/_mock';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  RenderCellProduct,
  RenderCellCreatedAt,
  RenderCellProductBatchNumber,
  RenderCellProductModelNumber,
  RenderCellProductLocation,
} from '../batches/manage_batches-table-row';
import { GIFT_CARD_ENDPOINT, REPLICATOR_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import EcommerceSaleByGender from 'src/sections/overview/e-commerce/ecommerce-sale-by-gender';
import { Card, Grid } from '@mui/material';
import EcommerceLatestProducts from 'src/sections/overview/e-commerce/ecommerce-latest-products';
import ProductTableFiltersResult from '../batches/manage_batches-table-filters-result';
import { Stack } from '@mui/system';


// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 2, label: 'No' },
];

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['Business', 'actions'];

// ----------------------------------------------------------------------

export default function ProductListView() {
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  // Listing data
  const getListingData = async () => {
    try {
      // const response = await ManageAPIsData(REPLICATOR_ENDPOINT, 'GET');
      const fetchMethod = 'GET';
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(REPLICATOR_ENDPOINT, fetchMethod, { headers });
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

  // Single record delete
  const handleDeleteRow = useCallback(
    async (id) => {
      try {

        const apiUrl = `${REPLICATOR_ENDPOINT}?id=${id}`;
        const response = await ManageAPIsData(apiUrl, 'DELETE');

        if (response.ok) {

          const updatedTableData = tableData.filter((row) => row.id !== id);
          enqueueSnackbar('Delete success!');
          setTableData(updatedTableData);
        } else {
          console.error("Error deleting data:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    },
    [enqueueSnackbar, tableData]
  );


  const handleDeleteRows = useCallback(async () => {
    const deletedIds = selectedRowIds.join(',');
    // const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
    try {

      const apiUrl = `${REPLICATOR_ENDPOINT}?ids=${deletedIds}`;
      const response = await ManageAPIsData(apiUrl, 'DELETE');

      if (response.ok) {
        enqueueSnackbar('Delete success!');
        const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
        setTableData(deleteRows);
      } else {
        console.error("Error deleting data:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.manage_batches.details(id));
    },
    [router]
  );

  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      filterable: false,
    },
    {
      field: 'designer_id',
      headerName: 'Model Number',
      flex: 1,
      minWidth: "150",
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'Batch Number',
      headerName: 'Batch Number',
      flex: 1,
      minWidth: "150",
      hideable: false,
      renderCell: (params) => <RenderCellProductBatchNumber params={params} />,
    },
    {
      field: 'created_by_user',
      headerName: 'Created By',
      flex: 1,
      minWidth: "auto",
      hideable: false,
      renderCell: (params) => <RenderCellProductLocation params={params} />,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
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
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
      ],
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
              name: 'Batches',
              href: paths.dashboard.manage_batches.root,
            }
          ]}
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />
        <Card
          sx={{
            height: { xs: 800, md: 2 },
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            checkboxSelection
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
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: () => (
                <>
                  <GridToolbarContainer>
                    {/* <ProductTableToolbar
                      filters={filters}
                      onFilters={handleFilters}
                      stockOptions={PRODUCT_STOCK_OPTIONS}
                      publishOptions={PUBLISH_OPTIONS}
                    /> */}

                    <GridToolbarQuickFilter />

                    <Stack
                      spacing={1}
                      flexGrow={1}
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      {!!selectedRowIds.length && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          onClick={confirmRows.onTrue}
                        >
                          Delete ({selectedRowIds.length})
                        </Button>
                      )}

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

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
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
