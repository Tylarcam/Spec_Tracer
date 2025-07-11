
import { useToast } from '@/hooks/use-toast';

interface NotifyOptions {
  title: string;
  description?: string;
}

export const useNotification = () => {
  const { toast } = useToast();

  return {
    success: ({ title, description }: NotifyOptions) =>
      toast({ title, description }),
    error: ({ title, description }: NotifyOptions) =>
      toast({ title, description, variant: 'destructive' }),
    info: ({ title, description }: NotifyOptions) =>
      toast({ title, description }),
  };
}; 
