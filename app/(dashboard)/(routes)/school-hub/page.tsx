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
  User,
  Eye,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { School } from '@/lib/minio-school-types'
import { useAdminStatus } from '@/hooks/use-admin-status'
import { SchoolPreviewImage, SchoolBannerImage } from '@/components/school-image-display'

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
  const [isCompetitionExpanded, setIsCompetitionExpanded] = useState(false)
  const [chapterAdminAccess, setChapterAdminAccess] = useState<ChapterAdminAccess>({
    isChapterSuperAdmin: false,
    isChapterAdmin: false,
    managedSchools: []
  })
  const [schoolRoles, setSchoolRoles] = useState<Record<string, string>>({})

  // Check chapter admin access
  const checkChapterAdminAccess = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/chapter-admins?userId=${user.id}`)
      if (response.ok) {
        const responseData = await response.json()
        const adminData = responseData.admins || []
        const managedSchools = adminData.map((admin: any) => admin.schoolId)
        const isSuperAdmin = adminData.some((admin: any) => admin.role === 'CHAPTER_SUPER_ADMIN')
        const isAdmin = adminData.length > 0

        setChapterAdminAccess({
          isChapterSuperAdmin: isSuperAdmin,
          isChapterAdmin: isAdmin,
          managedSchools
        })
        
        // Store the detailed admin data for per-school role checking
        const schoolRoles = adminData.reduce((acc: any, admin: any) => {
          acc[admin.schoolId] = admin.role
          return acc
        }, {})
        setSchoolRoles(schoolRoles)
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
      const userRoleForSchool = schoolRoles[schoolId]
      if (userRoleForSchool === 'CHAPTER_SUPER_ADMIN') return 'chapter_super_admin'
      if (userRoleForSchool === 'CHAPTER_ADMIN') return 'chapter_admin'
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

  return (
    <div className="min-h-screen bg-n-8 p-4 sm:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-bold text-n-1 mb-2">School Chapter Hub.</h1>
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

        {/* Cambright Annual School Challenge */}
        <div className="mb-8">
          <Card className="bg-purple-900/20 border-purple-500/30 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div 
                    className="cursor-pointer"
                    onClick={() => setIsCompetitionExpanded(!isCompetitionExpanded)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-purple-300">
                        Cambright&apos;s Annual School Challenge
                      </h2>
                      <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-500/10">
                        {isCompetitionExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-n-2 text-lg mb-4">
                      Schools with the most volunteer hours, image posts, and events hosted under Cambright get a <span className="font-bold text-purple-300">$1,000 grant!</span>
                    </p>
                  </div>
                  
                  {isCompetitionExpanded && (
                    <div className="space-y-4 text-n-3 animate-in fade-in-0 slide-in-from-top-1">
                      <div>
                        <h3 className="font-semibold text-purple-300 mb-2">Challenge Details:</h3>
                        <ul className="space-y-2 text-sm sm:text-base">
                          <li>• Post images must have &quot;Cambright&quot; somewhere visible</li>
                          <li>• Activities include: tutoring friends, helping teachers, volunteering, hosting school events</li>
                          <li>• Documentation and images required for all activities</li>
                          <li>• All activities must be posted with proper documentation</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20">
                        <h3 className="font-semibold text-purple-300 mb-2 flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Want to add your school?
                        </h3>
                        <p className="text-sm sm:text-base mb-3">
                          Join the Cambright Discord and post in the #school-channel:
                        </p>
                        <ul className="text-sm space-y-1 mb-4">
                          <li>• School name, website, email, phone number</li>
                          <li>• School board (Cambright usernames or names)</li>
                          <li>• Banner and icon images</li>
                        </ul>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open('https://discord.gg/k3qWavX2km', '_blank')}
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Join Discord
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Schools List - One Row Per School */}
        <div className="space-y-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="bg-n-7 border-n-6 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center min-h-[200px]">
                  {/* Left Side: Circular School Image */}
                  <div className="flex items-center justify-center p-8 flex-shrink-0">
                    <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 shadow-xl transition-all duration-300">
                      <SchoolPreviewImage
                        school={school}
                        width={144}
                        height={144}
                        objectFit="cover"
                        className="w-full h-full object-center group-hover:scale-110 transition-transform duration-500"
                        onError={(error) => {
                          console.error(`Failed to load preview image for school ${school.name}:`, error);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Middle: School Info and Large Stats */}
                  <div className="flex-1 p-6 pr-8 flex flex-col justify-center min-w-0">
                    {/* School Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <CardTitle className="text-n-1 group-hover:text-primary transition-colors text-2xl font-bold truncate">
                            {school.name}
                          </CardTitle>
                          <Badge 
                            variant={school.rank <= 3 ? 'default' : 'secondary'} 
                            className={`text-lg px-4 py-2 font-bold ${
                              school.rank === 1 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                              school.rank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-400/40' :
                              school.rank === 3 ? 'bg-amber-600/20 text-amber-300 border-amber-600/40' :
                              'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            }`}
                          >
                            #{school.rank}
                          </Badge>
                        </div>
                        
                        {school.description && (
                          <p className="text-n-3 text-lg mb-3 line-clamp-2 leading-relaxed">{school.description}</p>
                        )}
                        
                        <div className="flex items-center text-n-4 text-base">
                          <MapPin className="w-5 h-5 mr-2 text-primary" />
                          <span>{school.location || 'Location not specified'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Large Statistics Display */}
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20 group-hover:border-primary/30 transition-colors">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {(school.activeMembers || 0).toLocaleString()}
                        </div>
                        <div className="text-n-3 text-sm font-medium flex items-center justify-center">
                          <Users className="w-5 h-5 mr-2" />
                          Active Members
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 text-center border border-green-500/20 group-hover:border-green-500/30 transition-colors">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          {(school.volunteerHours || 0).toLocaleString()}
                        </div>
                        <div className="text-n-3 text-sm font-medium flex items-center justify-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Volunteer Hours
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-3">
                      <Badge variant={school.isActive ? 'default' : 'secondary'} className="text-sm px-4 py-2">
                        {school.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Right Side: Purple Aesthetic Design */}
                  <div className="w-80 lg:w-96 p-6 bg-purple-900/20 rounded-r-lg backdrop-blur-sm border-l border-purple-500/30">
                    {/* Banner Image with Purple Frame */}
                    <div className="relative mb-6">
                      <div className="h-40 relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-purple-500/20">
                        {(school.bannerAssetId || school.imageAssetId || school.imageUrl) ? (
                          <>
                            <SchoolBannerImage
                              school={school}
                              width={384}
                              height={160}
                              objectFit="cover"
                              className="w-full h-full object-center group-hover:scale-110 transition-transform duration-700"
                              onError={(error) => {
                                console.error(`Failed to load banner image for school ${school.name}:`, error);
                              }}
                            />
                            {/* Subtle overlay for depth */}
                            <div className="absolute inset-0 bg-purple-900/20"></div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-purple-800/30 flex items-center justify-center relative overflow-hidden">
                            <div className="text-center z-10">
                              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center backdrop-blur-sm">
                                <Globe className="w-8 h-8 text-purple-300" />
                              </div>
                              <p className="text-purple-200 font-medium" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>Beautiful banner awaits</p>
                              <p className="text-purple-400 text-sm mt-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>Upload to showcase your school</p>
                            </div>
                            {/* Purple background pattern */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-4 left-4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>
                              <div className="absolute bottom-6 right-6 w-16 h-16 bg-purple-600/30 rounded-full blur-lg"></div>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Floating rank badge */}
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-sm font-bold ${
                          school.rank === 1 ? 'bg-yellow-500 text-black' :
                          school.rank === 2 ? 'bg-gray-400 text-black' :
                          school.rank === 3 ? 'bg-amber-600 text-white' :
                          'bg-purple-600 text-white'
                        }`} style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                          #{school.rank}
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Access Card - Purple Design */}
                    {canManageSchool(school.id) && (
                      <div className="mb-6 p-5 bg-purple-800/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center mr-3">
                            <Shield className="w-4 h-4 text-purple-300" />
                          </div>
                          <h4 className="text-n-1 font-semibold">Your Access</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {hasAdminAccess && (
                            <div className="flex items-center p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                              <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center mr-3">
                                <Shield className="w-3 h-3 text-purple-300" />
                              </div>
                              <div>
                                <p className="text-purple-300 font-medium text-sm">Super Administrator</p>
                                <p className="text-n-4 text-xs">Full platform access - can manage all schools</p>
                              </div>
                            </div>
                          )}
                          
                          {!hasAdminAccess && getUserRole(school.id) === 'chapter_super_admin' && (
                            <div className="flex items-center p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                              <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center mr-3">
                                <UserCheck className="w-3 h-3 text-blue-300" />
                              </div>
                              <div>
                                <p className="text-blue-300 font-medium text-sm">School Administrator</p>
                                <p className="text-n-4 text-xs">Can post and manage content for this school</p>
                              </div>
                            </div>
                          )}
                          
                          {!hasAdminAccess && getUserRole(school.id) === 'chapter_admin' && (
                            <div className="flex items-center p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                              <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center mr-3">
                                <Settings className="w-3 h-3 text-blue-300" />
                              </div>
                              <div>
                                <p className="text-blue-300 font-medium text-sm">School Administrator</p>
                                <p className="text-n-4 text-xs">Can post and manage content for this school</p>
                              </div>
                            </div>
                          )}
                          
                          {!hasAdminAccess && getUserRole(school.id) !== 'chapter_super_admin' && getUserRole(school.id) !== 'chapter_admin' && (
                            <div className="flex items-center p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                              <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center mr-3">
                                <User className="w-3 h-3 text-green-300" />
                              </div>
                              <div>
                                <p className="text-green-300 font-medium text-sm">Student</p>
                                <p className="text-n-4 text-xs">Can view content but cannot post</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons - Purple Design */}
                    <div className="space-y-4">
                      {/* Primary Action */}
                      <Button
                        size="lg"
                        onClick={() => window.location.href = `/schools/${school.id}`}
                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <Eye className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        Explore School
                        <div className="ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </Button>
                      
                      {/* Management Actions - Always Show for All Users */}
                      <div className="space-y-3">
                        <div className="h-px bg-purple-500/30"></div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (canManageSchool(school.id)) {
                                window.location.href = hasAdminAccess ? `/admin/schools` : `/admin/chapter-dashboard`
                              } else {
                                // Show permission denied message
                                toast({
                                  title: "Access Denied",
                                  description: "You don't have permission to edit this school.",
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="h-12 border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 rounded-xl transition-all duration-300 group"
                          >
                            <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (hasAdminAccess) {
                                deleteSchool(school.id)
                              } else {
                                // Show permission denied message
                                toast({
                                  title: "Access Denied",
                                  description: "Only super admins can delete schools.",
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="h-12 border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl transition-all duration-300 group"
                          >
                            <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && !isLoading && (
          <div className="text-center py-12">
            {error ? (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-400 text-lg mb-2">Failed to load school chapters</p>
                  <p className="text-n-4 text-sm mb-4">There was an issue connecting to the database. Please try again.</p>
                </div>
                <div className="space-x-3">
                  <Button onClick={fetchSchools} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  {hasAdminAccess && (
                    <Button onClick={() => toast({
                      title: "School Management",
                      description: "Schools are now managed manually via configuration files. Check the SCHOOLS_SETUP_GUIDE.md for details.",
                      duration: 5000,
                    })} size="sm">
                      School Config Guide
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-n-4 text-lg mb-4">
                  {searchTerm ? 'No schools found matching your search.' : 'No schools available.'}
                </p>
                {hasAdminAccess && (
                  <Button onClick={() => toast({
                    title: "School Management",
                    description: "Schools are now managed manually via configuration files. Check the SCHOOLS_SETUP_GUIDE.md for details.",
                    duration: 5000,
                  })}>
                    School Config Guide
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 