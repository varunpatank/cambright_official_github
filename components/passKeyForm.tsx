import { saveAs } from "file-saver";
import { FileDown, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Label } from "./ui/customLabel";

const DownloadBtn = () => {
  const saveFile = () => {
    saveAs("/log.pdf", `Cambright - Tutor Volunteer Log`);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Check Circle Icon with Animation */}
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500 text-white">
        <CheckCircle className="w-16 h-16 animate-bounce" />
      </div>

      {/* Thank You Heading */}
      <h2 className="text-2xl font-bold text-gray-100 text-center">
        Thank You!
        <p className="text-sm text-gray-400">
          Your application was submitted!
        </p>{" "}
      </h2>

      {/* Informative Paragraph */}
      <p className="text-sm text-gray-400">
        We will get back to you within the next 24 hours with further details.
      </p>

      {/* Download Button */}
      <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0 mb-3">
        <LabelInputContainer>
          <Label htmlFor="email">Make sure to download:</Label>
          <Button onClick={saveFile} variant={"tert"}>
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Download Tutor Log
            </>
          </Button>
        </LabelInputContainer>
      </div>
    </div>
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

export default DownloadBtn;
