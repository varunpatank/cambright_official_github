// v0.0.01 salah
import { useToast } from "@/components/ui/use-toast";

const useErrorToast = () => {
  const { toast } = useToast();

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: `Something went wrong ⚠️`,
      description: "Please try again",
    });
  };

  return showErrorToast;
};

export default useErrorToast;
