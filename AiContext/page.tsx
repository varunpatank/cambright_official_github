"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, MapPin, Clock, Star, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for schools
const schools = [
  {
    id: 'riverside-high',
    name: 'Riverside High School',
    location: 'Oakland, CA',
    volunteerHours: 2847,
    rank: 1,
    members: 45,
    image: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800',
    president: 'Sarah Johnson'
  },
  {
    id: 'central-academy',
    name: 'Central Academy',
    location: 'San Francisco, CA',
    volunteerHours: 2634,
    rank: 2,
    members: 38,
    image: 'https://images.pexels.com/photos/289740/pexels-photo-289740.jpeg?auto=compress&cs=tinysrgb&w=800',
    president: 'Marcus Chen'
  },
  {
    id: 'westfield-prep',
    name: 'Westfield Prep',
    location: 'Berkeley, CA',
    volunteerHours: 2451,
    rank: 3,
    members: 42,
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800',
    president: 'Emily Rodriguez'
  },
  {
    id: 'lincoln-high',
    name: 'Lincoln High School',
    location: 'San Jose, CA',
    volunteerHours: 2298,
    rank: 4,
    members: 39,
    image: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
    president: 'David Kim'
  },
  {
    id: 'summit-charter',
    name: 'Summit Charter',
    location: 'Palo Alto, CA',
    volunteerHours: 2156,
    rank: 5,
    members: 33,
    image: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=800',
    president: 'Jessica Park'
  },
  {
    id: 'valley-high',
    name: 'Valley High School',
    location: 'Fremont, CA',
    volunteerHours: 1987,
    rank: 6,
    members: 36,
    image: 'https://images.pexels.com/photos/374054/pexels-photo-374054.jpeg?auto=compress&cs=tinysrgb&w=800',
    president: 'Alex Thompson'
  }
];

const prizes = [
  { rank: 1, prize: '$5,000 Scholarship Fund', color: 'text-yellow-400' },
  { rank: 2, prize: '$3,000 Scholarship Fund', color: 'text-slate-300' },
  { rank: 3, prize: '$2,000 Scholarship Fund', color: 'text-amber-400' },
];

export default function Home() {
  const [hoveredSchool, setHoveredSchool] = useState<string | null>(null);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Award className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Star className="w-5 h-5 text-amber-400" />;
    return <span className="text-sm font-bold text-purple-300">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-slate-800/50 shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-purple-400">
                School Chapter Hub
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Leaderboard Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Volunteer Hours Leaderboard</h2>
          </div>

          {/* Prize Announcements */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {prizes.map((prize) => (
              <Card key={prize.rank} className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    {getRankIcon(prize.rank)}
                    <span className="ml-3 font-bold text-xl text-white">
                      {prize.rank === 1 ? '1st' : prize.rank === 2 ? '2nd' : '3rd'} Place
                    </span>
                  </div>
                  <p className={`font-semibold text-lg ${prize.color}`}>{prize.prize}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top 3 Schools */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {schools.slice(0, 3).map((school) => (
              <Card key={school.id} className="overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 border-2 border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="relative h-40 bg-purple-600">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-4 left-4 flex items-center">
                      {getRankIcon(school.rank)}
                      <Badge className="ml-3 bg-white/90 text-slate-900 font-semibold">
                        Rank #{school.rank}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-xl mb-1">{school.name}</h3>
                      <p className="text-purple-200">{school.volunteerHours.toLocaleString()} hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All School Chapters */}
        <div>
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Our School Chapters</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools.map((school) => (
              <Link key={school.id} href={`/chapter/${school.id}`}>
                <Card 
                  className="group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.03] border-2 border-slate-700/50 bg-slate-900/60 backdrop-blur-sm"
                  onMouseEnter={() => setHoveredSchool(school.id)}
                  onMouseLeave={() => setHoveredSchool(null)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-56">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${school.image})` }}
                      ></div>
                      <div className="absolute inset-0 bg-black/60"></div>
                      
                      {/* Rank Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-purple-600/90 text-white font-semibold border border-purple-400/50">
                          #{school.rank}
                        </Badge>
                      </div>

                      {/* School Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                          {school.name}
                        </h3>
                        <div className="flex items-center text-sm text-purple-200 mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          {school.location}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-purple-400" />
                            <div>
                              <p className="font-semibold text-white">{school.volunteerHours.toLocaleString()}</p>
                              <p className="text-xs text-purple-300">volunteer hours</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-emerald-400" />
                            <div>
                              <p className="font-semibold text-white">{school.members}</p>
                              <p className="text-xs text-emerald-300">active members</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div className={`absolute top-4 right-4 transition-all duration-300 ${
                        hoveredSchool === school.id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                      }`}>
                        <ChevronRight className="w-6 h-6 text-purple-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}