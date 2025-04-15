import React from 'react';
import { useLoading } from '../../contexts/LoadingContext';
import PageLoading from './page-loading';

export default function PageLoadingController() {
  const { isLoading } = useLoading();
  
  return <PageLoading isLoading={isLoading} />;
}