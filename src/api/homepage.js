import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetHomes() {
  const URL = endpoints.homepage.list;
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

export function UsegetHome(productId) {
  const URL = productId ? endpoints.homepage.details(productId) : null;

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

export function UseSearchHome(query) {
  const URL = query ? [endpoints.homepage.search, { params: { query } }] : '';

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

export const CreateHome = async (data) => {
  const response = await axios.post(endpoints.homepage.create, data);
  return response.data;
};

// Update user
export const UpdateHome = async (id, data) => {
  const response = await axios.put(endpoints.homepage.details(id), data);
  return response.data;
};

//  delete user
export const DeleteHome = async (id) => {
  const response = await axios.delete(endpoints.homepage.details(id));
  return response.data;
};

export const DeleteMultipleHome = async (id) => {
  const response = await axios.delete(endpoints.homepage.deletes(id));
  return response?.data;
};

export const HomeData = [
  { label: 'Section 1', id: 1 },
  { label: 'Section 2', id: 2 },
  { label: 'Section 3', id: 3 },
  { label: 'Section 4', id: 4 },
];
