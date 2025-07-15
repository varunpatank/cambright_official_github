"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Award,
  Clock,
  Crown,
  Heart,
  ImagePlus,
  Lock,
  MapPin,
  Send,
  Trophy,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import {
  createAnnouncement,
  getAnnouncementsBySchool,
  initializeSampleData,
  updateAnnouncementLikes,
  type Announcement
} from '../../lib/announcements'
import { schoolsData } from '../../chapter/data'

export default function ChapterDashboard() {
  const params = useParams();
  const schoolId = params?.schoolId as string;
  const school = schoolsData[schoolId as keyof typeof schoolsData];

  const [newUpdate, setNewUpdate] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    initializeSampleData();
    
    if (school) {
      loadAnnouncements();
    }
    
    return () => {
      setMounted(false);
    };
  }, [school]);

  const loadAnnouncements = async () => {
    if (!mounted) return;
    setLoading(true);
    const data = await getAnnouncementsBySchool(schoolId);
    if (mounted) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  // Don't render until component is mounted
  if (!mounted) {
    return null;
  }
  if (!school) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Chapter Not Found</h1>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allVolunteers: Array<{
    name: string;
    avatar: string;
    volunteerHours: number;
    isPresident?: boolean;
    role?: string;
  }> = [
    { ...school.president, volunteerHours: 312, isPresident: true },
    ...school.officers,
    ...school.members
  ].sort((a, b) => (b.volunteerHours || 0) - (a.volunteerHours || 0)).slice(0, 8);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (mounted) {
          setAttachedImage(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedImage = () => {
    if (!mounted) return;
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAuthSubmit = () => {
    if (!mounted) return;
    if (authInput.toLowerCase().trim() === school.president.name.toLowerCase().trim()) {
      setIsAuthenticated(true);
      setShowAuthPrompt(false);
      setAuthError('');
      setAuthInput('');
    } else {
      setAuthError('Invalid credentials. Only the chapter president can post announcements.');
    }
  };

  const handleTextareaClick = () => {
    if (!mounted) return;
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
    }
  };

  const handlePostUpdate = async () => {
    if (!mounted) return;
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (newUpdate.trim() || attachedImage) {
      const newAnnouncement = {
        school_id: schoolId,
        author_name: school.president.name,
        author_role: 'President',
        author_avatar: school.president.avatar,
        title: '',
        content: newUpdate,
        image_url: attachedImage || undefined,
        likes: 0,
        comments: 0
      };

      const createdAnnouncement = await createAnnouncement(newAnnouncement);
      
      if (createdAnnouncement && mounted) {
        setAnnouncements([createdAnnouncement, ...announcements]);
        setNewUpdate('');
        setAttachedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleLike = async (announcementId: string, currentLikes: number) => {
    if (!mounted) return;
    const newLikes = currentLikes + 1;
    const success = await updateAnnouncementLikes(announcementId, newLikes);
    
    if (success && mounted) {
      setAnnouncements(announcements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, likes: newLikes }
          : announcement
      ));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${school.image})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-purple-900/80 to-black/95"></div>

        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button variant="secondary" size="sm" className="bg-purple-600/90 hover:bg-purple-700 text-white border-purple-400/50 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-end">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 mr-3 border-0 text-white font-semibold">
                  <Trophy className="w-4 h-4 mr-1" />
                  Rank #{school.rank}
                </Badge>
                <div className="flex items-center text-sm text-purple-200">
                  <MapPin className="w-4 h-4 mr-1" />
                  {school.location}
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent">
                {school.name}
              </h1>
              <p className="text-xl text-purple-200">Led by {school.president.name}</p>
            </div>
            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-3xl font-bold text-white">{school.volunteerHours.toLocaleString()}</p>
              <p className="text-sm text-purple-300">Total Volunteer Hours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Top Volunteers</h2>
            <p className="text-slate-400">Our most dedicated chapter members</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allVolunteers.map((volunteer, index) => (
              <Card key={`volunteer-${volunteer.name}-${index}`} className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-16 h-16 mx-auto border-2 border-purple-500/50">
                      <AvatarImage src={volunteer.avatar} />
                      <AvatarFallback className="bg-purple-700 text-white text-lg">{volunteer.name[0]}</AvatarFallback>
                    </Avatar>
                    {index === 0 && <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />}
                    {index === 1 && <Award className="absolute -top-2 -right-2 w-6 h-6 text-slate-300" />}
                    {index === 2 && <Trophy className="absolute -top-2 -right-2 w-6 h-6 text-amber-400" />}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{volunteer.name}</h3>
                  {volunteer.isPresident === true && (
                    <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/50 mb-2">President</Badge>
                  )}
                  {volunteer.role && volunteer.isPresident !== true && (
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/50 mb-2">{volunteer.role}</Badge>
                  )}
                  <p className="mt-3 text-2xl font-bold text-emerald-400">{volunteer.volunteerHours || 0}</p>
                  <p className="text-sm text-slate-400">volunteer hours</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-white text-2xl">
              Chapter Announcements
              {isAuthenticated && (
                <Badge className="ml-3 bg-green-600/20 text-green-300 border-green-500/50">
                  <Crown className="w-3 h-3 mr-1" />
                  President Access
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAuthPrompt && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center mb-4">
                    <Lock className="w-6 h-6 text-yellow-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">President Verification Required</h3>
                  </div>
                  <p className="text-slate-300 mb-4">
                    Only the chapter president can post announcements. Please enter your full name to verify your identity.
                  </p>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={authInput}
                      onChange={(e) => setAuthInput(e.target.value)}
                      className="bg-black/50 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
                    />
                    {authError && (
                      <p className="text-red-400 text-sm">{authError}</p>
                    )}
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleAuthSubmit}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                      >
                        Verify Identity
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAuthPrompt(false);
                          setAuthError('');
                          setAuthInput('');
                        }}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-red-500/10 px-6 font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-800/50 to-black/50 rounded-lg p-6 mb-8 border border-purple-600/30">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12 border-2 border-yellow-500/50">
                  <AvatarImage src={school.president.avatar} />
                  <AvatarFallback className="bg-yellow-700 text-white">{school.president.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  {!isAuthenticated ? (
                    <div 
                      className="relative cursor-pointer"
                      onClick={handleTextareaClick}
                    >
                      <Textarea
                        placeholder="Share an announcement with your chapter..."
                        value=""
                        readOnly
                        rows={3}
                        className="bg-black/70 border-slate-600/50 text-white placeholder:text-slate-400 cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] rounded-md flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-300">Click to verify as president</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Share an announcement with your chapter..."
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                        rows={3}
                        className="bg-black/70 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-purple-500"
                      />
                      
                      {attachedImage && (
                        <div className="relative inline-block">
                          <img
                            src={attachedImage}
                            alt="Attached preview"
                            className="max-w-xs max-h-48 rounded-lg border border-slate-600/50"
                          />
                          <button
                            onClick={removeAttachedImage}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          >
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Attach Image
                          </Button>
                        </div>
                        <Button
                          onClick={handlePostUpdate}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={!newUpdate.trim() && !attachedImage}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Post Announcement
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">Loading announcements...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">No announcements yet. Be the first to share an update!</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={`announcement-${announcement.id}`} className="border-l-4 border-purple-500 pl-6 bg-gradient-to-r from-purple-900/20 to-black/10 p-6 rounded-r-lg hover:from-purple-900/30 transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12 border-2 border-purple-500/50">
                        <AvatarImage src={announcement.author_avatar} />
                        <AvatarFallback className="bg-purple-700 text-white">{announcement.author_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-semibold text-white text-lg">{announcement.author_name}</p>
                          <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/50">{announcement.author_role}</Badge>
                          <span className="text-sm text-slate-400">{formatTimestamp(announcement.created_at)}</span>
                        </div>
                        <p className="text-slate-200 mb-4 text-base leading-relaxed">{announcement.content}</p>
                        {announcement.image_url && (
                          <img
                            src={announcement.image_url}
                            alt="Announcement"
                            className="rounded-lg w-full max-w-2xl h-64 object-cover mb-4 border border-slate-600/30 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(announcement.image_url, '_blank')}
                          />
                        )}
                        <div className="flex items-center space-x-6 text-sm text-slate-400">
                          <button 
                            className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                            onClick={() => handleLike(announcement.id, announcement.likes)}
                          >
                            <Heart className="w-5 h-5" />
                            <span>{announcement.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}