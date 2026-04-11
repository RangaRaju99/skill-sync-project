import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface PaymentSaga {
  sessionId: number;
  mentorId: number;
  learnerId: number;
  amount: number;
  durationMinutes: number;
  hourlyRate: number;
  status: string;
  paymentReference?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const usePayment = (sessionId?: number) => {
  const queryClient = useQueryClient();

  const sagaQuery = useQuery({
    queryKey: ['payment-saga', sessionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payment/saga/${sessionId}`);
      return data.data as PaymentSaga;
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'INITIATED' || status === 'PAYMENT_PROCESSING') ? 3000 : false;
    }
  });

  const startSagaMutation = useMutation({
    mutationFn: async (req: { sessionId: number; mentorId: number; learnerId: number; durationMinutes: number }) => {
      const { data } = await apiClient.post('/payment/start', req);
      return data.data as PaymentSaga;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-saga', sessionId] })
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (req: { sessionId: number; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => {
      const { data } = await apiClient.post('/payment/verify', req);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-saga', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  return {
    saga: sagaQuery.data,
    isLoading: sagaQuery.isLoading,
    isStarting: startSagaMutation.isPending,
    isVerifying: verifyPaymentMutation.isPending,
    startSaga: startSagaMutation.mutateAsync,
    verifyPayment: verifyPaymentMutation.mutateAsync,
    error: (sagaQuery.error as any)?.response?.data?.message || null
  };
};
