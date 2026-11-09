import { useQuery } from '@tanstack/react-query';
import { homeService } from '../services/homeService';

export const useHomeSummary = () =>
  useQuery({
    queryKey: ['home', 'summary'],
    queryFn: ({ signal }) => homeService.getSummary({ signal }),
  });
