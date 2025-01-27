import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFEditor,
} from 'src/components/hook-form';
import { FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
import { GIFT_CARD_ENDPOINT } from '../../../utils/apiEndPoints';
import { Button, CardContent, Typography } from '@mui/material';
import { GridDeleteIcon } from '@mui/x-data-grid';
import { Box } from '@mui/system';
import { useResponsive } from 'src/hooks/use-responsive';

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [rows, setRows] = useState(currentProduct?.Rows || [{ id: 0, value: '', multiplication: '' }]);
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setTotalAmount(calculateTotal());
    setTotalCount(calculateCount());
  }, [rows]);

  const calculateTotal = () => {
    return rows.reduce((total, row) => {
      const value = parseInt(row.value) || 0;
      const multiplication = parseInt(row.multiplication) || 0;
      return total + value * multiplication;
    }, 0);
  };

  const calculateCount = () => {
    return rows.reduce((total, row) => {
      const multiplication = parseInt(row.multiplication) || 0;
      return total + multiplication;
    }, 0);
  };

  const addRow = () => {
    if (rows.length < 5) {
      const newRow = { id: rows.length, value: '', multiplication: '' };
      setRows(prevRows => [...prevRows, newRow]);
    } else {
      enqueueSnackbar('Maximum 5 rows allowed.', { variant: "warning" });
    }
  };

  const removeRow = (id) => {
    if (id !== 0) {
      setRows(prevRows => prevRows.filter(row => row.id !== id));
      enqueueSnackbar('Row deleted', { variant: "success" });
    }
  };

  const handleFieldChange = useMemo(() => {
    return (id, field, value) => {
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === id ? { ...row, [field]: value } : row
        )
      );
    };
  }, []);


  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      company_name: currentProduct?.company_name || '',
      email: currentProduct?.email || '',
      description: currentProduct?.description || '',
      rows: currentProduct?.rows || [{ id: 0, value: '', multiplication: '' }]
    }),
    [currentProduct]
  );

  const pairs = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];
  const createDynamicNestedSchema = (rows) => {
    const dynamicFields = rows.reduce((acc, row) => {
      if(!row.value ){
        acc[`value-${row.id}`] = Yup.string().required(`Value  is required`);
      }
      if(!row.multiplication){
        acc[`Multiplication-${row.id}`] = Yup.string().required(`Quantity  is required`);
      }
      console.log(acc)
      return acc;
    }, {});
  
    return Yup.object().shape({
      name: Yup.string().required('Name is required'),
      email: Yup.string().required('E-mail is required'),
      ...dynamicFields,
    });
  };
  // const NewProductSchema = Yup.object().shape({
  //   name: Yup.string().required('Name is required'),
  //   // company_name: Yup.string().required('Company name is required'),
  //   email: Yup.string().required('E-mail is required'),
   
  // });
const NewProductSchema = createDynamicNestedSchema(rows);
  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    // watch,
    // setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
      const formattedRows = currentProduct?.Rows?.map((item) => ({
        id: item.id || '',
        value: item.value || '', // Map the 'value' to 'value'
        multiplication: item.multiplication || '',
      }));
      setRows(formattedRows);
    } else {
      setRows([{ id: 0, value: '', multiplication: '' }]);
    }
  }, [currentProduct, defaultValues, reset]);

  // useEffect(() => {
  //   if (currentProduct && Array.isArray(currentProduct.Rows) && currentProduct.Rows.length > 0) {
  //     const formattedRows = currentProduct?.Rows.map((item) => ({
  //       id: item.id,
  //       denomination: item.denomination || '', // Map the 'denomination' to 'value'
  //       multiplication: item.multiplication || '',
  //     }));
  //     setRows(formattedRows);
  //   } else {
  //     setRows([{ id: 0, denomination: '', multiplication: '' }]);
  //   }
  // }, [currentProduct]);


  // const [error, setError] = useState("");

  const mapPairLabelToValue = (label) => {
    const pairOption = pairs.find((option) => option.label === label);
    return pairOption ? pairOption.value : null;
  };

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Update rows state before constructing the payload
      const denominations = rows.map((row) => ({
        id: row.id + 1,
        value: parseInt(row.value) || null,
        multiplication: parseInt(row.multiplication) || null,
      }));
      // Construct the final payload

      const payload = {
        type: 1,
        name: data.name,
        company_name: data.company_name,
        email: data.email,
        description: data.description,
        denominations: denominations,
      };
      const user = await FetchUserDetail();
      payload.apihitid = user.id
      const apiUrl = currentProduct ? `${GIFT_CARD_ENDPOINT}?id=${currentProduct.id}` : GIFT_CARD_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      payload.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, payload);
      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.gift_card.root);
      } else {
        const responseData = await response.json();
        // Check if the response contains an error message
        if (responseData && responseData.error) {
          // Display the error message to the user, for example, using a notification library
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }

    } catch (err) {
      console.error(err.message);
    }
  });

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>


            <RHFTextField id="name" name="name" label="Name" />


            <RHFTextField id="company_name" name="company_name" label="Company name" />

            <RHFTextField id="email" name="email" label="E-mail" />

            <Box mt={1} ml={12}>
              Gift cards
            </Box>
            <div>
              <Grid container spacing={2}>
                {rows.map((row) => (
                  <Grid container sx={{ justifyContent: "center", alignItems: "center" }} key={row.id} item xs={12}>
                    <Grid item xs={4}>
                      <RHFTextField
                        // disabled={currentProduct?.Rows?.length > 0}
                        value={row?.value}
                        id={`value-${row.id}`}
                        label="Value"
                        name={`value-${row.id}`}
                        onChange={(e) => { handleFieldChange(row.id, "value", e.target.value) }}
                      />
                    </Grid>

                    X

                    <Grid item xs={4}>
                      <RHFTextField
                        // disabled={currentProduct?.Rows?.length > 0}
                        value={row.multiplication}
                        id={`Multiplication-${row.id}`}
                        name={`Multiplication-${row.id}`}
                        label="Quantity"
                        onChange={(e) => handleFieldChange(row.id, 'multiplication', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2} >
                      {!currentProduct?.Rows?.length > 0 && row.id !== 0 && (
                        <Button

                          variant="contained"
                          color="secondary"
                          startIcon={<GridDeleteIcon />}
                          onClick={() => removeRow(row.id)}
                        >
                          Delete
                        </Button>)
                      }
                    </Grid>
                  </Grid>
                ))}
              </Grid>

              <Grid container sx={{ justifyContent: "center", alignItems: "center" }} spacing={2} mt={1}>
                <Grid item sx={{ textAlign: 'center' }}>
                  {!currentProduct && (
                    <Button variant="contained" onClick={addRow}>Add row +</Button>
                  )}
                </Grid>
              </Grid>
            </div>
            <RHFTextField id="description" name="description" label="Notes" />
            <Card variant="solid" sx={{ bgcolor: 'text.disabled', color: 'white', justifyContent: "center", alignItems: "center" }}  >
              <CardContent>
                <Typography level="title-md"> Summary</Typography>
                <Typography> Total amount of gift cards : {totalAmount}</Typography>
                <Typography>  Total gift cards : {totalCount}</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {/* {mdUp && <Grid md={4} />} */}
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
      {/* <div className="error">
        {error && <span className="error_message">{error}</span>}
      </div> */}
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>

  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
