// v.0.0.01 salah

import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewProps {
  url: string;
  name: string;
  courseId: string;
  attachmentId: string;
}

export const PDFPreview = ({ url, name, courseId, attachmentId }: PDFPreviewProps) => {
  const downloadUrl = `/api/courses/${courseId}/attachments/${attachmentId}`;

  return (
    <div className="border border-purple-500/20 rounded-xl p-8 bg-gradient-to-br from-slate-800/40 to-purple-900/20 hover:from-purple-800/30 hover:to-purple-700/20 transition-all duration-300 shadow-lg hover:shadow-purple-500/10 min-h-[200px]">
      <div className="flex flex-col space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6 flex-1">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold text-slate-200 mb-2">Course Notes</p>
              <p className="text-base text-slate-400">PDF Document • Click to download</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            size="default"
            asChild
            className="bg-purple-600/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-200 hover:text-white transition-all duration-200 px-6 py-3"
          >
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-5 w-5 mr-3" />
              Download PDF
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};