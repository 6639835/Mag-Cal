import { useState } from 'react';
import { Result } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

interface UseCalculationResult {
  result: Result | null;
  isMockData: boolean;
  loading: boolean;
  error: string | null;
  setResult: (data: Result, isMock?: boolean) => void;
  setError: (message: string) => void;
  setLoading: (isLoading: boolean) => void;
  clearResult: () => void;
}

export const useCalculation = (): UseCalculationResult => {
  const [result, setResultState] = useState<Result | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const { showToast } = useToast();

  const setResult = (data: Result, isMock: boolean = false): void => {
    setResultState(data);
    setIsMockData(isMock);
    showToast('Calculation completed successfully', 'success');
    setErrorState(null);
  };

  const setError = (message: string): void => {
    setErrorState(message);
    showToast(message, 'error');
  };

  const setLoading = (isLoading: boolean): void => {
    setLoadingState(isLoading);
  };

  const clearResult = (): void => {
    setResultState(null);
    setIsMockData(false);
    setErrorState(null);
  };

  return {
    result,
    isMockData,
    loading,
    error,
    setResult,
    setError,
    setLoading,
    clearResult
  };
}; 