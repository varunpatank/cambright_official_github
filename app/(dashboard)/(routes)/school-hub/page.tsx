'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { 
  Search, 
  MapPin, 
  Users, 
  Clock, 
  Trophy, 
  Crown, 
  Medal,
  Globe,
  Mail,
  Phone,
  Edit,
  Trash2,
  Shield,
  Settings,
  UserCheck,
  Eye
} from 'lucide-react'
import { School } from '@/lib/minio-school-types'
import { useAdminStatus } from '@/hooks/use-admin-status'

interface SchoolWithRank extends School {
  rank: number
}

interface ChapterAdminAccess {
  isChapterSuperAdmin: boolean
  isChapterAdmin: boolean
  managedSchools: string[]
}

export default function SchoolHubPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const { isAdmin: hasAdminAccess } = useAdminStatus(user?.id)
  
  const [schools, setSchools] = useState<SchoolWithRank[]>([])
  const [filteredSchools, setFilteredSchools] = useState<SchoolWithRank[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapterAdminAccess, setChapterAdminAccess] = useState<ChapterAdminAccess>({
    isChapterSuperAdmin: false,
    isChapterAdmin: false,
    managedSchools: []
  })

  // Check chapter admin access
  const checkChapterAdminAccess = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/chapter-admins?userId=${user.id}`)
      if (response.ok) {
        const adminData = await response.json()
        const managedSchools = adminData.map((admin: any) => admin.schoolId)
        const isSuperAdmin = adminData.some((admin: any) => admin.role === 'chapter_super_admin')
        const isAdmin = adminData.length > 0

        setChapterAdminAccess({
          isChapterSuperAdmin: isSuperAdmin,
          isChapterAdmin: isAdmin,
          managedSchools
        })
      }
    } catch (error) {
      console.error('Error checking chapter admin access:', error)
    }
  }, [user?.id])

  // Fetch schools data
  const fetchSchools = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/schools')
      if (!response.ok) {
        throw new Error('Failed to fetch schools')
      }
      
      const data = await response.json()
      let schoolsData: School[] = data.schools || []
      
      // Filter schools based on user access
      if (!hasAdminAccess) {
        schoolsData = schoolsData.filter(school => school.isActive)
      }

      // Add volunteer data and other fields for display
      const schoolsWithVolunteerData = schoolsData.map((school: School, index: number) => ({
        ...school,
        volunteerHours: school.volunteerHours || Math.floor(Math.random() * 1000) + 500,
        activeMembers: school.activeMembers || Math.floor(Math.random() * 50) + 20,
        president: `President ${index + 1}`,
      }));

      // Sort by volunteer hours for leaderboard
      schoolsWithVolunteerData.sort((a: School, b: School) => (b.volunteerHours || 0) - (a.volunteerHours || 0));
      
      // Add ranks after sorting
      const schoolsWithRanks: SchoolWithRank[] = schoolsWithVolunteerData.map((school: School, index: number) => ({
        ...school,
        rank: index + 1
      }));

      setSchools(schoolsWithRanks);
      setFilteredSchools(schoolsWithRanks);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load school chapters');
    } finally {
      setIsLoading(false);
    }
  }, [hasAdminAccess]);

  // Filter schools based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSchools(schools)
    } else {
      const filtered = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSchools(filtered)
    }
  }, [searchTerm, schools])

  // Load schools and check chapter admin access on component mount
  useEffect(() => {
    fetchSchools()
    checkChapterAdminAccess()
  }, [fetchSchools, checkChapterAdminAccess])

  // Helper function to check if user can manage a school
  const canManageSchool = (schoolId: string) => {
    return hasAdminAccess || chapterAdminAccess.managedSchools.includes(schoolId)
  }

  // Helper function to get user's role for a school
  const getUserRole = (schoolId: string) => {
    if (hasAdminAccess) return 'super_admin'
    if (chapterAdminAccess.managedSchools.includes(schoolId)) {
      return chapterAdminAccess.isChapterSuperAdmin ? 'chapter_super_admin' : 'chapter_admin'
    }
    return null
  }

  // Admin functions
  const toggleSchoolStatus = async (school: SchoolWithRank) => {
    if (!canManageSchool(school.id)) {
      toast({
        title: 'Access Denied',
        description: 'You need admin access to perform this action',
        variant: 'destructive'
      })
      return
    }

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

  const deleteSchool = async (schoolId: string) => {
    if (!canManageSchool(schoolId)) {
      toast({
        title: 'Access Denied',
        description: 'You need admin access to perform this action',
        variant: 'destructive'
      })
      return
    }

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
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-primary">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-amber-500 to-amber-700'
      default:
        return 'from-n-6 to-n-7'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-n-3">Loading school chapters...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchSchools} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-n-8 p-4 sm:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-n-1 mb-2">School Chapter Hub</h1>
            <p className="text-n-3 text-base sm:text-lg">
              Discover and connect with school chapters worldwide
            </p>
          </div>
          
          {(hasAdminAccess || chapterAdminAccess.isChapterAdmin) && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {hasAdminAccess && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-4 h-4 mr-1" />
                  Super Admin
                </Badge>
              )}
              
              {chapterAdminAccess.isChapterSuperAdmin && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <UserCheck className="w-4 h-4 mr-1" />
                  Chapter Super Admin
                </Badge>
              )}
              
              {chapterAdminAccess.isChapterAdmin && !chapterAdminAccess.isChapterSuperAdmin && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                  <Settings className="w-4 h-4 mr-1" />
                  Chapter Admin
                </Badge>
              )}
              
              {hasAdminAccess && (
                <Button 
                  onClick={() => window.location.href = '/admin/schools'}
                  className="bg-primary hover:bg-primary/90 text-n-8 font-medium"
                >
                  Manage Schools
                </Button>
              )}
              
              {chapterAdminAccess.isChapterAdmin && !hasAdminAccess && (
                <Button 
                  onClick={() => window.location.href = '/admin/chapter-dashboard'}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  My Chapter Dashboard
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-n-4" />
            <Input
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-n-7 border-n-6 text-n-1 placeholder:text-n-4"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-n-7 border-n-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-n-1 flex items-center text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                Total Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-n-1">{schools.length}</div>
              <p className="text-n-4 text-xs sm:text-sm">Active chapters worldwide</p>
            </CardContent>
          </Card>

          <Card className="bg-n-7 border-n-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-n-1 flex items-center text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                Total Volunteer Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-n-1">
                {schools.reduce((total, school) => total + (school.volunteerHours || 0), 0).toLocaleString()}
              </div>
              <p className="text-n-4 text-xs sm:text-sm">Hours contributed globally</p>
            </CardContent>
          </Card>

          <Card className="bg-n-7 border-n-6 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-n-1 flex items-center text-sm sm:text-base">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-n-1">
                {schools.reduce((total, school) => total + (school.activeMembers || 0), 0).toLocaleString()}
              </div>
              <p className="text-n-4 text-xs sm:text-sm">Members across all chapters</p>
            </CardContent>
          </Card>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="bg-n-7 border-n-6 hover:border-primary/50 transition-colors group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${getRankColor(school.rank)} flex items-center justify-center flex-shrink-0`}>
                      {getRankIcon(school.rank)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-n-1 group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                        {school.name}
                      </CardTitle>
                      <div className="flex items-center text-n-4 text-xs sm:text-sm mt-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{school.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Badge variant={school.isActive ? 'default' : 'secondary'} className="text-xs">
                        {school.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      {/* Chapter Admin Role Badge */}
                      {canManageSchool(school.id) && !hasAdminAccess && (
                        <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {getUserRole(school.id) === 'chapter_super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Management Actions */}
                    {canManageSchool(school.id) && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = hasAdminAccess ? `/admin/schools` : `/admin/chapter-dashboard`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {hasAdminAccess && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSchool(school.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {school.description && (
                  <CardDescription className="text-n-3 mt-2">
                    {school.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* School Image */}
                {school.imageUrl && (
                  <div className="w-full h-40 rounded-lg overflow-hidden">
                    <img
                      src={school.imageUrl}
                      alt={school.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-n-6 rounded-lg">
                    <div className="text-2xl font-bold text-n-1">{school.volunteerHours || 0}</div>
                    <div className="text-n-4 text-sm">Volunteer Hours</div>
                  </div>
                  <div className="text-center p-3 bg-n-6 rounded-lg">
                    <div className="text-2xl font-bold text-n-1">{school.activeMembers || 0}</div>
                    <div className="text-n-4 text-sm">Active Members</div>
                  </div>
                </div>

                {/* Chapter Admin Info */}
                {(school.chapterSuperAdmin || (school.chapterAdmins && school.chapterAdmins.length > 0)) && (
                  <div className="border-t border-n-6 pt-4">
                    <h4 className="text-n-2 font-medium mb-2">Chapter Leadership</h4>
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
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="border-t border-n-6 pt-4">
                  <div className="space-y-2">
                    {school.website && (
                      <div className="flex items-center text-n-3 text-sm">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={school.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {school.email && (
                      <div className="flex items-center text-n-3 text-sm">
                        <Mail className="w-4 h-4 mr-2" />
                        <a 
                          href={`mailto:${school.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {school.email}
                        </a>
                      </div>
                    )}
                    {school.phone && (
                      <div className="flex items-center text-n-3 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{school.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View School Button */}
                <div className="border-t border-n-6 pt-4">
                  <Button 
                    onClick={() => window.location.href = `/schools/${school.id}`}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View School
                  </Button>
                </div>

                {/* Admin Controls */}
                {hasAdminAccess && (
                  <div className="border-t border-n-6 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-n-3 text-sm">Status Control</span>
                      <Switch
                        checked={school.isActive}
                        onCheckedChange={() => toggleSchoolStatus(school)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-n-4 text-lg mb-4">
              {searchTerm ? 'No schools found matching your search.' : 'No schools available.'}
            </p>
            {hasAdminAccess && (
              <Button onClick={() => window.location.href = '/admin/schools'}>
                Add First School
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 