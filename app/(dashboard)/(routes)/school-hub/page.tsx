'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  MapPin, 
  Users, 
  Clock, 
  Trophy, 
  Crown, 
  Medal,
  Globe,
  Eye,
  ExternalLink,
  Heart,
  Sparkles
} from 'lucide-react'
import { getAllSchools, getTotalStats, searchSchools, type StaticSchool } from '@/data/schools-static'

interface SchoolWithRank extends StaticSchool {
  rank: number
}

export default function SchoolHubPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Get static schools data
  const allSchools = useMemo(() => {
    const schools = getAllSchools()
    // Sort by volunteer hours for leaderboard
    const sorted = [...schools].sort((a, b) => b.volunteerHours - a.volunteerHours)
    // Add ranks
    return sorted.map((school, index) => ({
      ...school,
      rank: index + 1
    })) as SchoolWithRank[]
  }, [])

  const stats = useMemo(() => getTotalStats(), [])

  // Filter schools based on search
  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) return allSchools
    const results = searchSchools(searchTerm)
    // Re-apply ranks based on original ranking
    return results.map(school => {
      const originalSchool = allSchools.find(s => s.id === school.id)
      return {
        ...school,
        rank: originalSchool?.rank || 0
      }
    }) as SchoolWithRank[]
  }, [searchTerm, allSchools])

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

  return (
    <div className="min-h-screen bg-n-8 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Global Community</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-n-1 mb-6 tracking-tight">
            School Chapters
          </h1>
          
          <p className="text-n-3 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Meet the incredible schools making a difference in their communities through 
            tutoring, mentorship, and volunteer work with CamBright.
          </p>
        </div>

        {/* About Section */}
        <div className="mb-10">
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-n-1 mb-3">
                    Making an Impact Together
                  </h2>
                  <p className="text-n-3 text-base sm:text-lg leading-relaxed">
                    Our school chapters are at the heart of CamBright&apos;s mission. Students across the globe 
                    volunteer their time to tutor peers, organize educational events, assist teachers, and 
                    build stronger learning communities. Every hour logged represents real impact — students 
                    helping students succeed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative w-full max-w-md mx-auto sm:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-n-4" />
            <Input
              placeholder="Search schools by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-n-7 border-n-6 text-n-1 placeholder:text-n-4 rounded-xl text-base"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <Card className="bg-n-7 border-n-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 mr-2 text-primary" />
                <span className="text-n-3 text-sm">Total Schools</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-n-1">{stats.totalSchools}</div>
              <p className="text-n-4 text-xs sm:text-sm">Active chapters worldwide</p>
            </CardContent>
          </Card>

          <Card className="bg-n-7 border-n-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                <span className="text-n-3 text-sm">Total Volunteer Hours</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-n-1">
                {stats.totalVolunteerHours.toLocaleString()}
              </div>
              <p className="text-n-4 text-xs sm:text-sm">Hours contributed globally</p>
            </CardContent>
          </Card>

          <Card className="bg-n-7 border-n-6 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center mb-2">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                <span className="text-n-3 text-sm">Active Members</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-n-1">
                {stats.totalMembers.toLocaleString()}
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
                <div className="flex flex-col lg:flex-row items-stretch min-h-[200px]">
                  {/* Left Side: Circular School Image */}
                  <div className="flex items-center justify-center p-8 flex-shrink-0">
                    <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 shadow-xl transition-all duration-300">
                      <img
                        src={school.imageUrl}
                        alt={school.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  
                  {/* Middle: School Info and Large Stats */}
                  <div className="flex-1 p-6 pr-8 flex flex-col justify-center min-w-0">
                    {/* School Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-4 mb-2 flex-wrap">
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
                        
                        <p className="text-n-3 text-lg mb-3 line-clamp-2 leading-relaxed">{school.description}</p>
                        
                        <div className="flex items-center text-n-4 text-base">
                          <MapPin className="w-5 h-5 mr-2 text-primary" />
                          <span>{school.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Large Statistics Display */}
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20 group-hover:border-primary/30 transition-colors">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {school.activeMembers.toLocaleString()}
                        </div>
                        <div className="text-n-3 text-sm font-medium flex items-center justify-center">
                          <Users className="w-5 h-5 mr-2" />
                          Active Members
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 text-center border border-green-500/20 group-hover:border-green-500/30 transition-colors">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          {school.volunteerHours.toLocaleString()}
                        </div>
                        <div className="text-n-3 text-sm font-medium flex items-center justify-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Volunteer Hours
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="text-sm px-4 py-2">
                        Active
                      </Badge>
                      {school.events.length > 0 && (
                        <Badge variant="secondary" className="text-sm px-4 py-2 bg-purple-500/20 text-purple-300">
                          {school.events.length} Event{school.events.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side: Purple Aesthetic Design */}
                  <div className="w-full lg:w-80 xl:w-96 p-6 bg-purple-900/20 lg:rounded-r-lg backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-purple-500/30">
                    {/* Banner Image with Purple Frame */}
                    <div className="relative mb-6">
                      <div className="h-40 relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-purple-500/20">
                        <img
                          src={school.bannerUrl}
                          alt={`${school.name} banner`}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Subtle overlay for depth */}
                        <div className="absolute inset-0 bg-purple-900/20"></div>
                      </div>
                      
                      {/* Floating rank badge */}
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-sm font-bold ${
                          school.rank === 1 ? 'bg-yellow-500 text-black' :
                          school.rank === 2 ? 'bg-gray-400 text-black' :
                          school.rank === 3 ? 'bg-amber-600 text-white' :
                          'bg-purple-600 text-white'
                        }`}>
                          #{school.rank}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Info */}
                    <div className="mb-6 p-4 bg-purple-800/20 rounded-xl border border-purple-500/30">
                      <h4 className="text-n-1 font-semibold mb-3 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-purple-300" />
                        Quick Info
                      </h4>
                      <div className="space-y-2 text-sm">
                        {school.website && (
                          <a 
                            href={school.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-purple-300 hover:text-purple-200 transition-colors"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                        {school.email && (
                          <a 
                            href={`mailto:${school.email}`}
                            className="flex items-center text-n-3 hover:text-n-1 transition-colors"
                          >
                            <span className="truncate">{school.email}</span>
                          </a>
                        )}
                        {school.admins.length > 0 && (
                          <p className="text-n-4">
                            {school.admins.length} Administrator{school.admins.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-n-4 text-lg mb-4">
              {searchTerm ? 'No schools found matching your search.' : 'No schools available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
