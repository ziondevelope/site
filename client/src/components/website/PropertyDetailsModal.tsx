import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { WebsiteConfig } from "@shared/schema";
import PropertyDetailsContent from "./PropertyDetailsContent";
import { X } from "lucide-react";

interface PropertyDetailsModalProps {
  propertyId: number | string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsModal({
  propertyId,
  isOpen,
  onClose
}: PropertyDetailsModalProps) {
  // Fetch website configuration to get the primary color
  const { data: config } = useQuery<WebsiteConfig>({
    queryKey: ['/api/website/config']
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="p-6 md:p-8">
            <PropertyDetailsContent 
              propertyId={propertyId} 
              isModal={true} 
              onClose={onClose}
              primaryColor={config?.primaryColor}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}