import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetCategories() {
  const URL = endpoints.category.list;
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

export function UsegetCategory(productId) {
  const URL = productId ? endpoints.category.details(productId) : null;

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

export function UseSearchCategory(query) {
  const URL = query ? [endpoints.category.search, { params: { query } }] : '';

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

export const CreateCategory = async (data) => {
  const response = await axios.post(endpoints.category.create, data);
  return response.data;
};

// Update user
export const UpdateCategory = async (id, data) => {
  const response = await axios.put(endpoints.category.details(id), data);
  return response.data;
};

// Upload csv file
export const CategoryUploadCSV = async (data) => {
  const response = await axios.post(endpoints.category.csv, data);
  return response.data;
};

//  delete user
export const DeleteCategory = async (id) => {
  const response = await axios.delete(endpoints.category.details(id));
  return response.data;
};

export const DeleteMultiple = async (id) => {
  const response = await axios.delete(endpoints.category.deletes(id));
  return response?.data;
};
