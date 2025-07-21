'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, 
  Clock, 
  Settings, 
  UserCheck,
  Edit,
  MapPin,
  Globe,
  Mail,
  Phone,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react'
import { School } from '@/lib/minio-school-types'
import { useRouter } from 'next/navigation'

interface ChapterAdminData {
  schoolId: string
  role: 'chapter_super_admin' | 'chapter_admin'
  assignedAt: string
  assignedBy: string
}

interface ManagedSchool extends School {
  adminRole: 'chapter_super_admin' | 'chapter_admin'
}

export default function ChapterAdminDashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  
  const [managedSchools, setManagedSchools] = useState<ManagedSchool[]>([])
  const [chapterAdminData, setChapterAdminData] = useState<ChapterAdminData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingStats, setEditingStats] = useState<string | null>(null)
  const [statsForm, setStatsForm] = useState({ volunteerHours: 0, activeMembers: 0 })

  // Fetch chapter admin data and managed schools
  const fetchManagedSchools = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // Get chapter admin data for current user
      const adminResponse = await fetch(`/api/chapter-admins?userId=${user.id}`)
      if (!adminResponse.ok) {
        throw new Error('Failed to fetch chapter admin data')
      }
      
      const adminResponseData = await adminResponse.json()
      const adminData = adminResponseData.admins || []
      
      // Transform admin data to match expected format
      const transformedAdminData = adminData.map((admin: any) => ({
        schoolId: admin.schoolId,
        role: admin.role.toLowerCase(), // Convert CHAPTER_ADMIN to chapter_admin
        assignedAt: admin.createdAt,
        assignedBy: admin.assignedBy
      }))
      
      setChapterAdminData(transformedAdminData)

      if (transformedAdminData.length === 0) {
        setError('You are not assigned as a chapter admin for any schools')
        return
      }

      // Get school details for managed schools
      const schoolsResponse = await fetch('/api/schools?limit=1000')
      if (!schoolsResponse.ok) {
        throw new Error('Failed to fetch schools')
      }
      
      const schoolsData = await schoolsResponse.json()
      const allSchools: School[] = schoolsData.schools || []
      
      // Filter and enhance schools with admin role
      const managed = allSchools
        .filter(school => transformedAdminData.some((admin: ChapterAdminData) => admin.schoolId === school.id))
        .map(school => {
          const adminInfo = transformedAdminData.find((admin: ChapterAdminData) => admin.schoolId === school.id)
          return {
            ...school,
            adminRole: adminInfo?.role || 'chapter_admin'
          }
        })

      setManagedSchools(managed)
    } catch (err) {
      console.error('Error fetching managed schools:', err)
      setError(err instanceof Error ? err.message : 'Failed to load managed schools')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchManagedSchools()
  }, [fetchManagedSchools])

  // Update school stats
  const updateSchoolStats = async (schoolId: string, updates: { volunteerHours?: number; activeMembers?: number }) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/stats`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update school stats')
      }

      toast({
        title: 'Success',
        description: 'School statistics updated successfully'
      })

      fetchManagedSchools()
      setEditingStats(null)
    } catch (error) {
      console.error('Error updating school stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to update school statistics',
        variant: 'destructive'
      })
    }
  }

  const startEditingStats = (school: ManagedSchool) => {
    setEditingStats(school.id)
    setStatsForm({
      volunteerHours: school.volunteerHours || 0,
      activeMembers: school.activeMembers || 0
    })
  }

  const saveStats = (schoolId: string) => {
    updateSchoolStats(schoolId, statsForm)
  }

  const getTotalStats = () => {
    return managedSchools.reduce((acc, school) => ({
      totalVolunteerHours: acc.totalVolunteerHours + (school.volunteerHours || 0),
      totalActiveMembers: acc.totalActiveMembers + (school.activeMembers || 0)
    }), { totalVolunteerHours: 0, totalActiveMembers: 0 })
  }

  const canEditVolunteerHours = (role: string) => role === 'chapter_super_admin'
  const canEditActiveMembers = (role: string) => role === 'chapter_super_admin' || role === 'chapter_admin'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-n-3">Loading your chapter dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.push('/school-hub')} variant="outline">
            Back to School Hub
          </Button>
        </div>
      </div>
    )
  }

  const { totalVolunteerHours, totalActiveMembers } = getTotalStats()
  const isChapterSuperAdmin = chapterAdminData.some(admin => admin.role === 'chapter_super_admin')

  return (
    <div className="min-h-screen bg-n-8 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-n-1 mb-2">Chapter Admin Dashboard</h1>
            <p className="text-n-3 text-lg">
              Manage your assigned school chapters
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {isChapterSuperAdmin && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                <UserCheck className="w-4 h-4 mr-1" />
                Chapter Super Admin
              </Badge>
            )}
            
            {!isChapterSuperAdmin && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                <Settings className="w-4 h-4 mr-1" />
                Chapter Admin
              </Badge>
            )}
            
            <Button 
              onClick={() => router.push('/school-hub')}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              Back to School Hub
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-n-7 border-n-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-n-1 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Managed Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-n-1">{managedSchools.length}</div>
              <p className="text-n-4 text-sm">Schools under your management</p>
            </CardContent>
          </Card>

          <Card className="bg-n-7 border-n-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-n-1 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Total Volunteer Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-n-1">{totalVolunteerHours.toLocaleString()}</div>
              <p className="text-n-4 text-sm">Across all managed schools</p>
            </CardContent>
          </Card>

          <Card className="bg-n-7 border-n-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-n-1 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-n-1">{totalActiveMembers.toLocaleString()}</div>
              <p className="text-n-4 text-sm">Total active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Managed Schools */}
        <div>
          <h2 className="text-2xl font-bold text-n-1 mb-6">Your Managed Schools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managedSchools.map((school) => (
              <Card key={school.id} className="bg-n-7 border-n-6 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-n-1 mb-2">{school.name}</CardTitle>
                      <div className="flex items-center text-n-4 text-sm mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {school.location || 'Location not specified'}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          school.adminRole === 'chapter_super_admin' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}
                      >
                        {school.adminRole === 'chapter_super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                    
                    <Badge variant={school.isActive ? 'default' : 'secondary'} className="text-xs">
                      {school.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {school.description && (
                    <p className="text-n-3 text-sm">{school.description}</p>
                  )}
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {school.website && (
                      <div className="flex items-center text-n-4 text-sm">
                        <Globe className="w-3 h-3 mr-2" />
                        <a 
                          href={school.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    
                    {school.email && (
                      <div className="flex items-center text-n-4 text-sm">
                        <Mail className="w-3 h-3 mr-2" />
                        <a 
                          href={`mailto:${school.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {school.email}
                        </a>
                      </div>
                    )}
                    
                    {school.phone && (
                      <div className="flex items-center text-n-4 text-sm">
                        <Phone className="w-3 h-3 mr-2" />
                        <a 
                          href={`tel:${school.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {school.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Stats Management */}
                  <div className="border-t border-n-6 pt-4">
                    <div className="space-y-3">
                      {/* Volunteer Hours */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-n-4" />
                          <span className="text-n-3 text-sm">Volunteer Hours</span>
                        </div>
                        
                        {editingStats === school.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={statsForm.volunteerHours}
                              onChange={(e) => setStatsForm(prev => ({ ...prev, volunteerHours: parseInt(e.target.value) || 0 }))}
                              className="w-20 h-8 text-xs"
                              disabled={!canEditVolunteerHours(school.adminRole)}
                            />
                            <Button
                              size="sm"
                              onClick={() => saveStats(school.id)}
                              className="h-8 px-3 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingStats(null)}
                              className="h-8 px-3 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-n-1 font-medium">{school.volunteerHours || 0}</span>
                            {canEditVolunteerHours(school.adminRole) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingStats(school)}
                                className="h-8 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Active Members */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-n-4" />
                          <span className="text-n-3 text-sm">Active Members</span>
                        </div>
                        
                        {editingStats === school.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={statsForm.activeMembers}
                              onChange={(e) => setStatsForm(prev => ({ ...prev, activeMembers: parseInt(e.target.value) || 0 }))}
                              className="w-20 h-8 text-xs"
                              disabled={!canEditActiveMembers(school.adminRole)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-n-1 font-medium">{school.activeMembers || 0}</span>
                            {canEditActiveMembers(school.adminRole) && editingStats !== school.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingStats(school)}
                                className="h-8 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 