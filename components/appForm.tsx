import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/customLabel";
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";

type AppFormProps = {
  app_message: string;
  onChange: (name: string, value: string) => void;
};

const AppForm: React.FC<AppFormProps> = ({ app_message, onChange }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-100 text-center">
        Finally..
      </h2>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <LabelInputContainer>
          <Label htmlFor="message" className="flex items-center space-x-2">
            <span>Application Message</span>
            <Smile className="text-xl" />
          </Label>
          <Textarea
            required
            id="message"
            placeholder="Describe your experience, more about yourself.. and why should we approve you? + any questions or requests"
            value={app_message}
            onChange={(e) => onChange("app_message", e.target.value)}
            className="w-full h-48"
          />
        </LabelInputContainer>
      </div>
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default AppForm;
