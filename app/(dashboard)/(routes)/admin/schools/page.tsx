'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Globe, Mail, Phone, MapPin, Users, Shield, Clock, UserPlus, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { School, ChapterAdmin } from '@/lib/minio-school-types'

interface User {
  id: string
  name: string
  email: string
  imageUrl?: string
  username?: string
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [deleteSchoolId, setDeleteSchoolId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Chapter admin management state
  const [isChapterAdminDialogOpen, setIsChapterAdminDialogOpen] = useState(false)
  const [selectedSchoolForAdmin, setSelectedSchoolForAdmin] = useState<School | null>(null)
  const [chapterAdmins, setChapterAdmins] = useState<ChapterAdmin[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<'chapter_super_admin' | 'chapter_admin'>('chapter_admin')

  // Stats editing state
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [selectedSchoolForStats, setSelectedSchoolForStats] = useState<School | null>(null)
  const [statsForm, setStatsForm] = useState({
    volunteerHours: 0,
    activeMembers: 0
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    email: '',
    phone: '',
    imageUrl: '',
    isActive: true,
    volunteerHours: 0,
    activeMembers: 0
  })

  // Fetch schools from API
  const fetchSchools = useCallback(async () => {
    try {
      console.log('Fetching schools...')
      setIsLoading(true)
      
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/schools?limit=1000&_t=${Date.now()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch schools')
      }
      const data = await response.json()
      
      console.log('Schools fetched:', data.schools?.length || 0, 'schools')
      
      setSchools(data.schools || [])
      setFilteredSchools(data.schools || [])
    } catch (error) {
      console.error('Error fetching schools:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch schools',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUserSearchResults([])
      return
    }

    try {
      setIsSearchingUsers(true)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search users')
      }
      const users = await response.json()
      setUserSearchResults(users)
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive'
      })
    } finally {
      setIsSearchingUsers(false)
    }
  }, [toast])

  // Fetch chapter admins for a school
  const fetchChapterAdmins = useCallback(async (schoolId: string) => {
    try {
      const response = await fetch(`/api/chapter-admins?schoolId=${schoolId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch chapter admins')
      }
      const admins = await response.json()
      setChapterAdmins(admins)
    } catch (error) {
      console.error('Error fetching chapter admins:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch chapter admins',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Filter schools based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSchools(schools)
    } else {
      const filtered = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSchools(filtered)
    }
  }, [searchTerm, schools])

  // Load schools on component mount
  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  // Search users when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery) {
        searchUsers(userSearchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [userSearchQuery, searchUsers])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      website: '',
      email: '',
      phone: '',
      imageUrl: '',
      isActive: true,
      volunteerHours: 0,
      activeMembers: 0
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingSchool ? `/api/schools/${editingSchool.id}` : '/api/schools'
      const method = editingSchool ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save school')
      }

      toast({
        title: 'Success',
        description: `School ${editingSchool ? 'updated' : 'created'} successfully`,
      })

      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingSchool(null)
      resetForm()
      fetchSchools()
    } catch (error) {
      console.error('Error saving school:', error)
      toast({
        title: 'Error',
        description: 'Failed to save school',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (school: School) => {
    setEditingSchool(school)
    setFormData({
      name: school.name,
      description: school.description || '',
      location: school.location || '',
      website: school.website || '',
      email: school.email || '',
      phone: school.phone || '',
      imageUrl: school.imageUrl || '',
      isActive: school.isActive,
      volunteerHours: school.volunteerHours || 0,
      activeMembers: school.activeMembers || 0
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete school')
      }

      toast({
        title: 'Success',
        description: 'School deleted successfully',
      })

      fetchSchools()
    } catch (error) {
      console.error('Error deleting school:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete school',
        variant: 'destructive'
      })
    } finally {
      setDeleteSchoolId(null)
    }
  }

  const handleStatusToggle = async (school: School) => {
    try {
      const response = await fetch(`/api/schools/${school.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...school,
          isActive: !school.isActive
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update school status')
      }

      toast({
        title: 'Success',
        description: `School ${!school.isActive ? 'activated' : 'deactivated'} successfully`,
      })

      fetchSchools()
    } catch (error) {
      console.error('Error updating school status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update school status',
        variant: 'destructive'
      })
    }
  }

  // Handle chapter admin management
  const handleManageChapterAdmins = (school: School) => {
    setSelectedSchoolForAdmin(school)
    setIsChapterAdminDialogOpen(true)
    fetchChapterAdmins(school.id)
  }

  const handleAssignChapterAdmin = async () => {
    if (!selectedUser || !selectedSchoolForAdmin) return

    try {
      const response = await fetch('/api/chapter-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: selectedSchoolForAdmin.id,
          targetUserId: selectedUser.id,
          role: selectedRole
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign chapter admin')
      }

      toast({
        title: 'Success',
        description: 'Chapter admin assigned successfully',
      })

      setSelectedUser(null)
      setUserSearchQuery('')
      setUserSearchResults([])
      fetchChapterAdmins(selectedSchoolForAdmin.id)
      fetchSchools() // Refresh schools to update admin info
    } catch (error) {
      console.error('Error assigning chapter admin:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign chapter admin',
        variant: 'destructive'
      })
    }
  }

  const handleRemoveChapterAdmin = async (userId: string) => {
    if (!selectedSchoolForAdmin) return

    try {
      const response = await fetch(`/api/chapter-admins?schoolId=${selectedSchoolForAdmin.id}&userId=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove chapter admin')
      }

      toast({
        title: 'Success',
        description: 'Chapter admin removed successfully',
      })

      fetchChapterAdmins(selectedSchoolForAdmin.id)
      fetchSchools() // Refresh schools to update admin info
    } catch (error) {
      console.error('Error removing chapter admin:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove chapter admin',
        variant: 'destructive'
      })
    }
  }

  // Handle stats editing
  const handleEditStats = (school: School) => {
    setSelectedSchoolForStats(school)
    setStatsForm({
      volunteerHours: school.volunteerHours || 0,
      activeMembers: school.activeMembers || 0
    })
    setIsStatsDialogOpen(true)
  }

  const handleUpdateStats = async () => {
    if (!selectedSchoolForStats) return

    try {
      console.log('Updating stats for school:', selectedSchoolForStats.id, 'with data:', statsForm)
      
      const response = await fetch(`/api/schools/${selectedSchoolForStats.id}/stats`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statsForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Stats update API error:', errorData)
        throw new Error(errorData.error || 'Failed to update stats')
      }

      const updatedSchool = await response.json()
      console.log('Stats updated successfully:', updatedSchool)

      toast({
        title: 'Success',
        description: 'School stats updated successfully',
      })

      setIsStatsDialogOpen(false)
      setSelectedSchoolForStats(null)
      
      // Refresh the schools list to show updated data
      await fetchSchools()
    } catch (error) {
      console.error('Error updating stats:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update stats',
        variant: 'destructive'
      })
    }
  }

  const SchoolForm = () => {
    const [localFormData, setLocalFormData] = useState(formData)
    
    // Sync with parent form data when dialog opens
    useEffect(() => {
      setLocalFormData(formData)
    }, [formData])

    const handleInputChange = useCallback((field: string, value: string | number | boolean) => {
      setLocalFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      setIsSubmitting(true)

      try {
        const url = editingSchool ? `/api/schools/${editingSchool.id}` : '/api/schools'
        const method = editingSchool ? 'PUT' : 'POST'
        
        console.log('Submitting form data:', localFormData)
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localFormData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to save school')
        }

        const savedSchool = await response.json()
        console.log('School saved successfully:', savedSchool)

        toast({
          title: 'Success',
          description: `School ${editingSchool ? 'updated' : 'created'} successfully`,
        })

        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingSchool(null)
        resetForm()
        
        // Refresh the schools list
        await fetchSchools()
      } catch (error) {
        console.error('Error saving school:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save school',
          variant: 'destructive'
        })
      } finally {
        setIsSubmitting(false)
      }
    }, [localFormData, editingSchool, toast, fetchSchools])

    return (
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                value={localFormData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={localFormData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={localFormData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={localFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={localFormData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={localFormData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="volunteerHours">Volunteer Hours</Label>
              <Input
                id="volunteerHours"
                type="number"
                min="0"
                value={localFormData.volunteerHours}
                onChange={(e) => handleInputChange('volunteerHours', parseInt(e.target.value) || 0)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label htmlFor="activeMembers">Active Members</Label>
              <Input
                id="activeMembers"
                type="number"
                min="0"
                value={localFormData.activeMembers}
                onChange={(e) => handleInputChange('activeMembers', parseInt(e.target.value) || 0)}
                autoComplete="off"
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={localFormData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={localFormData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingSchool(null)
                resetForm()
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
    )
  }

  return (
    <div className="p-6 bg-n-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-n-1">School Management</h1>
            <p className="text-n-3 mt-1">Manage schools and chapter administrators</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-n-8 font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-radix-dialog-content>
              <DialogHeader>
                <DialogTitle>Add New School</DialogTitle>
              </DialogHeader>
              <SchoolForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-n-4" />
            <Input
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-n-7 border-n-6"
            />
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-n-7 rounded-lg border border-n-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-n-6">
                <TableHead className="text-n-2">School</TableHead>
                <TableHead className="text-n-2">Location</TableHead>
                <TableHead className="text-n-2">Stats</TableHead>
                <TableHead className="text-n-2">Admins</TableHead>
                <TableHead className="text-n-2">Status</TableHead>
                <TableHead className="text-n-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-n-3">
                    Loading schools...
                  </TableCell>
                </TableRow>
              ) : filteredSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-n-3">
                    No schools found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchools.map((school) => (
                  <TableRow key={school.id} className="border-n-6">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {school.imageUrl && (
                          <img
                            src={school.imageUrl}
                            alt={school.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-n-1">{school.name}</div>
                          <div className="text-sm text-n-3 flex items-center mt-1">
                            <Globe className="w-3 h-3 mr-1" />
                            {school.website ? (
                              <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                {school.website}
                              </a>
                            ) : (
                              'No website'
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-n-2">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-n-4" />
                        {school.location || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell className="text-n-2">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Clock className="w-3 h-3 mr-1 text-n-4" />
                          {school.volunteerHours || 0} hours
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="w-3 h-3 mr-1 text-n-4" />
                          {school.activeMembers || 0} members
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-n-2">
                      <div className="space-y-1">
                        {school.chapterSuperAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                        {school.chapterAdmins && school.chapterAdmins.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {school.chapterAdmins.length} Admin{school.chapterAdmins.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {(!school.chapterSuperAdmin && (!school.chapterAdmins || school.chapterAdmins.length === 0)) && (
                          <span className="text-xs text-n-4">No admins</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={school.isActive ? 'default' : 'secondary'}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStats(school)}
                          className="text-n-3 hover:text-n-1"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManageChapterAdmins(school)}
                          className="text-n-3 hover:text-n-1"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(school)}
                          className="text-n-3 hover:text-n-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteSchoolId(school.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl" data-radix-dialog-content>
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
            </DialogHeader>
            <SchoolForm />
          </DialogContent>
        </Dialog>

        {/* Chapter Admin Management Dialog */}
        <Dialog open={isChapterAdminDialogOpen} onOpenChange={setIsChapterAdminDialogOpen}>
          <DialogContent className="max-w-4xl" data-radix-dialog-content>
            <DialogHeader>
              <DialogTitle>Manage Chapter Admins - {selectedSchoolForAdmin?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Add New Admin */}
              <div className="border border-n-6 rounded-lg p-4">
                <h3 className="font-medium text-n-1 mb-4">Add Chapter Admin</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Search User</Label>
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-n-7 border-n-6"
                      autoComplete="off"
                      onFocus={(e) => e.target.select()}
                    />
                    {isSearchingUsers && (
                      <p className="text-sm text-n-4 mt-2">Searching...</p>
                    )}
                    {userSearchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-n-6 rounded-lg">
                        {userSearchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-n-6 cursor-pointer border-b border-n-6 last:border-b-0"
                            onClick={() => {
                              setSelectedUser(user)
                              setUserSearchQuery(user.name)
                              setUserSearchResults([])
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              {user.imageUrl && (
                                <img
                                  src={user.imageUrl}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                <div className="font-medium text-n-1">{user.name}</div>
                                <div className="text-sm text-n-3">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={selectedRole} onValueChange={(value: 'chapter_super_admin' | 'chapter_admin') => setSelectedRole(value)}>
                      <SelectTrigger className="bg-n-7 border-n-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chapter_admin">Chapter Admin</SelectItem>
                        <SelectItem value="chapter_super_admin">Chapter Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignChapterAdmin}
                    disabled={!selectedUser}
                    className="w-full bg-primary hover:bg-primary/90 text-n-8 font-medium disabled:opacity-50"
                  >
                    Assign Admin
                  </Button>
                </div>
              </div>

              {/* Current Admins */}
              <div className="border border-n-6 rounded-lg p-4">
                <h3 className="font-medium text-n-1 mb-4">Current Admins</h3>
                {chapterAdmins.length === 0 ? (
                  <p className="text-n-4 text-center py-4">No chapter admins assigned</p>
                ) : (
                  <div className="space-y-3">
                    {chapterAdmins.map((admin) => (
                      <div key={admin.userId} className="flex items-center justify-between p-3 bg-n-6 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium text-n-1">{admin.userName}</div>
                            <div className="text-sm text-n-3">{admin.userEmail}</div>
                          </div>
                          <Badge variant={admin.role === 'chapter_super_admin' ? 'default' : 'secondary'}>
                            {admin.role === 'chapter_super_admin' ? 'Super Admin' : 'Admin'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChapterAdmin(admin.userId)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Edit Dialog */}
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogContent data-radix-dialog-content>
            <DialogHeader>
              <DialogTitle>Edit School Stats - {selectedSchoolForStats?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="volunteerHours">Volunteer Hours</Label>
                <Input
                  id="volunteerHours"
                  type="number"
                  min="0"
                  value={statsForm.volunteerHours}
                  onChange={(e) => setStatsForm({ ...statsForm, volunteerHours: parseInt(e.target.value) || 0 })}
                  className="bg-n-7 border-n-6"
                  autoComplete="off"
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div>
                <Label htmlFor="activeMembers">Active Members</Label>
                <Input
                  id="activeMembers"
                  type="number"
                  min="0"
                  value={statsForm.activeMembers}
                  onChange={(e) => setStatsForm({ ...statsForm, activeMembers: parseInt(e.target.value) || 0 })}
                  className="bg-n-7 border-n-6"
                  autoComplete="off"
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsStatsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateStats} className="bg-primary hover:bg-primary/90 text-n-8 font-medium">
                  Update Stats
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteSchoolId} onOpenChange={() => setDeleteSchoolId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the school and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteSchoolId && handleDelete(deleteSchoolId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 