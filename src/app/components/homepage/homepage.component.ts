import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Post {
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

interface Contact {
  name: string;
  initials: string;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  userName: string = 'User';
  userInitials: string = 'U';
  
  samplePosts: Post[] = [
    {
      authorName: 'John Doe',
      authorInitials: 'JD',
      timeAgo: '2 hours ago',
      content: 'Just finished an amazing workout! 💪 Feeling energized and ready to take on the day!',
      likes: 45,
      comments: 12
    },
    {
      authorName: 'Sarah Smith',
      authorInitials: 'SS',
      timeAgo: '5 hours ago',
      content: 'Beautiful sunset from my evening walk 🌅',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      likes: 128,
      comments: 34
    },
    {
      authorName: 'Mike Johnson',
      authorInitials: 'MJ',
      timeAgo: '1 day ago',
      content: 'Excited to announce that I\'ve joined Trove Social! Looking forward to connecting with all of you! 🎉',
      likes: 89,
      comments: 23
    },
    {
      authorName: 'Emily Davis',
      authorInitials: 'ED',
      timeAgo: '2 days ago',
      content: 'Coffee and coding - the perfect combination ☕💻',
      likes: 67,
      comments: 15
    }
  ];

  sampleContacts: Contact[] = [
    { name: 'Alex Brown', initials: 'AB' },
    { name: 'Lisa Wilson', initials: 'LW' },
    { name: 'David Lee', initials: 'DL' },
    { name: 'Emma Taylor', initials: 'ET' },
    { name: 'Chris Anderson', initials: 'CA' },
    { name: 'Olivia Martinez', initials: 'OM' }
  ];

  trendingTopics: string[] = [
    '#TechNews',
    '#WeekendVibes',
    '#MotivationMonday',
    '#ThrowbackThursday',
    '#FoodieFriday'
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Get user info from localStorage or service
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = user.firstName || 'User';
      this.userInitials = (user.firstName?.[0] || 'U') + (user.lastName?.[0] || '');
    }
  }

  openCreatePostModal(): void {
    // TODO: Implement create post modal
    console.log('Open create post modal');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/signup']);
  }
}
