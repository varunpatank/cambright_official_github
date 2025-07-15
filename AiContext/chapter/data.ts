// Mock data for schools
export const schoolsData = {
  'riverside-high': {
    id: 'riverside-high',
    name: 'Riverside High School',
    location: 'Oakland, CA',
    volunteerHours: 2847,
    rank: 1,
    memberCount: 45,
    image: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1200',
    president: {
      name: 'Sarah Johnson',
      role: 'President',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinDate: '2023-08-15'
    },
    officers: [
      {
        name: 'Michael Davis',
        role: 'Vice President',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        volunteerHours: 234
      },
      {
        name: 'Lisa Chen',
        role: 'Secretary',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
        volunteerHours: 198
      },
      {
        name: 'James Wilson',
        role: 'Treasurer',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        volunteerHours: 156
      }
    ],
    members: [
      { name: 'Emma Thompson', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100', volunteerHours: 87 },
      { name: 'Ryan Garcia', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100', volunteerHours: 92 },
      { name: 'Sofia Martinez', avatar: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=100', volunteerHours: 76 },
      { name: 'Alex Kim', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100', volunteerHours: 103 }
    ],
    updates: [
      {
        id: 1,
        author: 'Sarah Johnson',
        role: 'President',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        timestamp: '2 days ago',
        title: 'Community Food Drive Success! 🎉',
        content: 'Amazing turnout at our weekend food drive! We collected over 500 items for the local food bank. Thank you to everyone who participated!',
        image: 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg?auto=compress&cs=tinysrgb&w=600',
        likes: 23,
        comments: 8
      },
      {
        id: 2,
        author: 'Sarah Johnson',
        role: 'President',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        timestamp: '1 week ago',
        title: 'Upcoming Beach Cleanup - March 15th',
        content: 'Join us for our monthly beach cleanup at Ocean Beach! Meet at the main parking lot at 9 AM. Supplies will be provided. Let\'s keep our community beautiful! 🏖️',
        likes: 31,
        comments: 12
      },
      {
        id: 3,
        author: 'Michael Davis',
        role: 'Vice President',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        timestamp: '2 weeks ago',
        title: 'Tutoring Program Update',
        content: 'Our tutoring program is expanding! We now have 15 tutors helping elementary students with math and reading. Great work everyone!',
        likes: 18,
        comments: 5
      }
    ]
  },
  'central-academy': {
    id: 'central-academy',
    name: 'Central Academy',
    location: 'San Francisco, CA',
    volunteerHours: 2634,
    rank: 2,
    memberCount: 38,
    image: 'https://images.pexels.com/photos/289740/pexels-photo-289740.jpeg?auto=compress&cs=tinysrgb&w=1200',
    president: {
      name: 'Marcus Chen',
      role: 'President',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinDate: '2023-09-01'
    },
    officers: [
      {
        name: 'Jennifer Liu',
        role: 'Vice President',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
        volunteerHours: 201
      }
    ],
    members: [
      { name: 'Kevin Wong', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100', volunteerHours: 95 }
    ],
    updates: [
      {
        id: 1,
        author: 'Marcus Chen',
        role: 'President',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
        timestamp: '3 days ago',
        title: 'Tech Workshop for Seniors',
        content: 'Successfully hosted our monthly tech workshop for senior citizens. 25 participants learned about smartphone basics and online safety!',
        likes: 19,
        comments: 6
      }
    ]
  },
  'westfield-prep': {
    id: 'westfield-prep',
    name: 'Westfield Prep',
    location: 'Berkeley, CA',
    volunteerHours: 2451,
    rank: 3,
    memberCount: 42,
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=1200',
    president: {
      name: 'Emily Rodriguez',
      role: 'President',
      avatar: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinDate: '2023-08-20'
    },
    officers: [],
    members: [],
    updates: []
  },
  'lincoln-high': {
    id: 'lincoln-high',
    name: 'Lincoln High School',
    location: 'San Jose, CA',
    volunteerHours: 2298,
    rank: 4,
    memberCount: 39,
    image: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1200',
    president: {
      name: 'David Kim',
      role: 'President',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinDate: '2023-09-10'
    },
    officers: [],
    members: [],
    updates: []
  },
  'summit-charter': {
    id: 'summit-charter',
    name: 'Summit Charter',
    location: 'Palo Alto, CA',
    volunteerHours: 2156,
    rank: 5,
    memberCount: 33,
    image: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=1200',
    president: {
      name: 'Jessica Park',
      role: 'President',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinDate: '2023-08-25'
    },
    officers: [],
    members: [],
    updates: []
  },
  'valley-high': {
    id: 'valley-high',
    name: 'Valley High School',
    location: 'Fremont, CA',
    volunteerHours: 1987,
    rank: 6,
    memberCount: 36,
    image: 'https://images.pexels.com/photos/374054/pexels-photo-374054.jpeg?auto=compress&cs=tinysrgb&w=1200',
    president: {
      name: 'Alex Thompson',
      role: 'President',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinDate: '2023-09-05'
    },
    officers: [],
    members: [],
    updates: []
  }
};