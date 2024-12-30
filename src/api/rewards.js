import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';
import { REWARDS_CSV_FILE } from 'src/utils/apiendpoints';

// ----------------------------------------------------------------------

export function UsegetRewards() {
  const URL = endpoints.rewards.list;
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

export function UsegetReward(productId) {
  const URL = productId ? endpoints.rewards.details(productId) : null;

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

export function UseSearchReward(query) {
  const URL = query ? [endpoints.rewards.search, { params: { query } }] : '';

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

export const CreateRewards = async (data) => {
  const response = await axios.post(endpoints.rewards.create, data);
  return response.data;
};

export const UploadCSV = async (id, data) => {
  const response = await axios.post(endpoints.rewards.imports(id), data);
  return response.data;
};

// Update user
export const UpdateRewards = async (id, data) => {
  const response = await axios.put(endpoints.rewards.details(id), data);
  return response.data;
};

//  delete user
export const DeleteRewards = async (id) => {
  const response = await axios.delete(endpoints.rewards.details(id));
  return response.data;
};

export const DeleteMultipleRewards = async (id) => {
  const response = await axios.delete(endpoints.rewards.deletes(id));
  return response?.data;
};
