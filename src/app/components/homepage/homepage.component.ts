import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService, Post, PostSummaryResponse } from '../../services/post.service';

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
  styleUrls: ['./homepage.component.css'],
  standalone: false
})
export class HomepageComponent implements OnInit {
  userName: string = 'User';
  userInitials: string = 'U';
  profilePicture: string | null = null;
  showNotifications: boolean = false;
  notificationCount: number = 0;
  activeNav: string = 'home';
  showCreateModal: boolean = false;
  userId: string = '';
  showToast: boolean = false;
  toastMessage: string = '';
  
  stats: Stats = {
    followers: 120,
    following: 180,
    posts: 0
  };

  posts: Post[] = [];
  postThumbnails: { [postId: number]: string } = {}; // Store base64 thumbnails
  loadingPosts: boolean = false;
  
  // Post viewer
  showPostViewer: boolean = false;
  selectedPost: Post | null = null;

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

  constructor(
    private router: Router,
    private postService: PostService
  ) { }

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
        this.userInitials = firstNameInitial || 'U';
        
        // Load profile picture if available
        if (user.profilePicture) {
          this.profilePicture = user.profilePicture;
          console.log('Profile picture loaded from localStorage');
        } else {
          this.profilePicture = null;
          console.log('No profile picture found in user data');
        }
        
        // Load user ID (try multiple possible field names)
        if (user.id) {
          this.userId = user.id.toString();
        } else if (user.userId) {
          this.userId = user.userId.toString();
        } else if (user._id) {
          this.userId = user._id.toString();
        }
        
        console.log('User data loaded:', { firstName: user.firstName, userName: this.userName, hasProfilePicture: !!this.profilePicture, userId: this.userId });
        
        // Fetch posts after user ID is loaded
        if (this.userId) {
          this.loadPosts();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.userName = 'User';
        this.userInitials = 'U';
        this.profilePicture = null;
      }
    } else {
      // If no user data found, redirect to login
      console.warn('No user data found, redirecting to login');
      this.router.navigate(['/login']);
    }

    // Update notification count
    this.updateNotificationCount();
  }

  loadPosts(): void {
    if (!this.userId) {
      console.error('User ID not available for loading posts');
      return;
    }

    this.loadingPosts = true;
    this.postService.getPostSummary(this.userId).subscribe({
      next: (response: PostSummaryResponse) => {
        console.log('Post summary loaded:', response);
        this.posts = response.posts || [];
        this.stats.posts = response.totalcount || 0;
        
        // Load thumbnails for all posts
        this.loadPostThumbnails();
        this.loadingPosts = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loadingPosts = false;
        this.showToastMessage('Failed to load posts. Please try again.');
      }
    });
  }

  loadPostThumbnails(): void {
    this.posts.forEach((post) => {
      if (post.imageUrls && post.imageUrls.length > 0) {
        const firstImageUrl = post.imageUrls[0];
        this.loadImageAsBase64(firstImageUrl, post.postId);
      }
    });
  }

  loadImageAsBase64(imageUrl: string, postId: number): void {
    this.postService.getImage(imageUrl).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.postThumbnails[postId] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (error) => {
        console.error(`Error loading thumbnail for post ${postId}:`, error);
      }
    });
  }

  openPostViewer(post: Post): void {
    this.selectedPost = post;
    this.showPostViewer = true;
  }

  closePostViewer(): void {
    this.showPostViewer = false;
    this.selectedPost = null;
  }

  hasMultipleImages(post: Post): boolean {
    return post.imageUrls && post.imageUrls.length > 1;
  }

  getThumbnail(postId: number): string | null {
    return this.postThumbnails[postId] || null;
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

  setActiveNav(nav: string): void {
    this.activeNav = nav;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onPostCreated(): void {
    // Show toast notification
    this.showToastMessage('Post shared successfully!');
    
    // Reload posts after a short delay
    setTimeout(() => {
      if (this.userId) {
        this.loadPosts();
      }
    }, 1500);
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
