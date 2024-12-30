import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetCompanyCategories() {
  const URL = endpoints.companycategory.list;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      products: data?.data || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !data?.data.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

// ----------------------------------------------------------------------

export function UsegetCompanyCategory(productId) {
  const URL = productId ? endpoints.companycategory.details(productId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      product: data?.data,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [(data?.data, error, isLoading, isValidating)]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function UseSearchCompanyCategory(query) {
  const URL = query ? [endpoints.companycategory.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.data || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.data.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const CreateCompanyCategory = async (data) => {
  const response = await axios.post(endpoints.companycategory.create, data);
  return response.data;
};

// Update user
export const UpdateCompanyCategory = async (id, data) => {
  const response = await axios.put(endpoints.companycategory.details(id), data);
  return response.data;
};

//  delete user
export const DeleteCompanyCategory = async (id) => {
  const response = await axios.delete(endpoints.companycategory.details(id));
  return response.data;
};

export const DeleteCompanyMultiple = async (id) => {
  const response = await axios.delete(endpoints.companycategory.deletes(id));
  return response?.data;
};
