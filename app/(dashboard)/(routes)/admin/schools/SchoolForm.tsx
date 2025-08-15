import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AssetUpload } from '@/components/asset-upload';
import { AssetImageLoader } from '@/components/asset-image-loader';

interface SchoolFormProps {
  formData: any;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  resetForm: () => void;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingSchool: any;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  resetForm,
  isAddDialogOpen,
  isEditDialogOpen,
  editingSchool,
}) => {
  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <style jsx>{`
        .school-form-container * {
          outline: none !important;
          box-shadow: none !important;
        }
        .school-form-container input:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5) !important;
          border-color: #6366f1 !important;
        }
        .school-form-container textarea:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5) !important;
          border-color: #6366f1 !important;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-4 school-form-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">School Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              autoComplete="off"
              className="focus:ring-2 focus:ring-primary focus:border-primary relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              autoComplete="off"
              className="relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              autoComplete="off"
              className="relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoComplete="off"
              className="relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              autoComplete="off"
              className="relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
          <div>
            <Label>School Image</Label>
            <AssetUpload
              assetType="SCHOOL_IMAGE"
              onChange={(assetKey) => {
                handleInputChange('imageAssetId', assetKey || '');
              }}
            />
            {formData.imageAssetId && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <AssetImageLoader
                  assetKey={formData.imageAssetId}
                  alt="School Image Preview"
                  width={200}
                  height={128}
                  className="max-w-full h-32 object-cover rounded-lg"
                  showLoadingState={true}
                  showErrorState={true}
                />
              </div>
            )}
          </div>
          <div>
            <Label>School Banner</Label>
            <AssetUpload
              assetType="SCHOOL_BANNER"
              onChange={(assetKey) => {
                handleInputChange('bannerAssetId', assetKey || '');
              }}
            />
            {formData.bannerAssetId && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <AssetImageLoader
                  assetKey={formData.bannerAssetId}
                  alt="School Banner Preview"
                  width={300}
                  height={150}
                  className="max-w-full h-32 object-cover rounded-lg"
                  showLoadingState={true}
                  showErrorState={true}
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="volunteerHours">Volunteer Hours</Label>
            <Input
              id="volunteerHours"
              type="number"
              min="0"
              value={formData.volunteerHours}
              onChange={(e) => handleInputChange('volunteerHours', parseInt(e.target.value) || 0)}
              autoComplete="off"
              className="relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
          <div>
            <Label htmlFor="activeMembers">Active Members</Label>
            <Input
              id="activeMembers"
              type="number"
              min="0"
              value={formData.activeMembers}
              onChange={(e) => handleInputChange('activeMembers', parseInt(e.target.value) || 0)}
              autoComplete="off"
              className="relative z-10 focus:outline-none"
              style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="relative z-10 focus:outline-none"
            style={{ position: 'relative', zIndex: 10, outline: 'none !important' }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleInputChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-primary hover:bg-primary/90 text-n-8 font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (editingSchool ? 'Update School' : 'Create School')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SchoolForm;
