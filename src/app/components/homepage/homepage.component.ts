import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Notification {
  message: string;
  actions?: {
    accept: string;
    ignore: string;
  };
}

interface Stats {
  followers: number;
  following: number;
  posts: number;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  userName: string = 'User';
  userInitials: string = 'U';
  showNotifications: boolean = false;
  notificationCount: number = 0;
  
  stats: Stats = {
    followers: 120,
    following: 180,
    posts: 45
  };

  photos: any[] = Array(6).fill(null); // 6 placeholder photos

  notifications: Notification[] = [
    {
      message: 'Rhea invited you to view her photos',
      actions: {
        accept: 'Accept',
        ignore: 'Ignore'
      }
    },
    {
      message: 'Arun requested access to your photos',
      actions: {
        accept: 'Approve',
        ignore: 'Decline'
      }
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Set first name as userName
        this.userName = user.firstName || 'User';
        // Set initials from first and last name
        const firstNameInitial = user.firstName?.[0]?.toUpperCase() || '';
        const lastNameInitial = user.lastName?.[0]?.toUpperCase() || '';
        this.userInitials = firstNameInitial + lastNameInitial || 'U';
        
        console.log('User data loaded:', { firstName: user.firstName, userName: this.userName });
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.userName = 'User';
        this.userInitials = 'U';
      }
    } else {
      // If no user data found, redirect to login
      console.warn('No user data found, redirecting to login');
      this.router.navigate(['/login']);
    }

    // Update notification count
    this.updateNotificationCount();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  updateNotificationCount(): void {
    this.notificationCount = this.notifications.length;
  }

  handleNotificationAction(notification: Notification, action: 'accept' | 'ignore'): void {
    console.log(`Notification action: ${action}`, notification);
    
    // Remove notification from list
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.updateNotificationCount();
    }

    // TODO: Implement actual API call to handle notification action
    if (action === 'accept') {
      // Handle accept action
      console.log('Accepted notification');
    } else {
      // Handle ignore action
      console.log('Ignored notification');
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
