import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeListPage } from './components/EmployeeListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Failures surface straight away instead of being masked by three silent
      // retries — the error state is part of what this page has to demonstrate.
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: { retry: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EmployeeListPage />
    </QueryClientProvider>
  );
}
