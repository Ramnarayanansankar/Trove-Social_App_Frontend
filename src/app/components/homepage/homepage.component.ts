import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
export class HomepageComponent implements OnInit, AfterViewInit, OnDestroy {
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
  loadingMorePosts: boolean = false;
  
  // Pagination state
  currentStartIndex: number = 0;
  currentEndIndex: number = 9; // Initial load: 0-9 (10 posts)
  hasMorePosts: boolean = true;
  
  // Scroll tracking for speed calculation
  lastScrollTop: number = 0;
  lastScrollTime: number = Date.now();
  scrollSpeed: number = 0; // pixels per second
  scrollTimeout: any = null;
  scrollListener: (() => void) | null = null;
  
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

  ngAfterViewInit(): void {
    // Setup scroll listener after view is initialized
    // Use multiple attempts to ensure DOM is ready
    setTimeout(() => {
      this.setupScrollListener();
    }, 100);
    
    // Also try after a longer delay in case content loads slowly
    setTimeout(() => {
      if (!this.scrollListener) {
        this.setupScrollListener();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    // Cleanup scroll listener
    if (this.scrollListener) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.removeEventListener('scroll', this.scrollListener);
      }
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  loadPosts(): void {
    if (!this.userId) {
      console.error('User ID not available for loading posts');
      return;
    }

    // Reset pagination state for initial load
    this.currentStartIndex = 0;
    this.currentEndIndex = 9;
    this.hasMorePosts = true;
    this.posts = [];
    this.postThumbnails = {};

    this.loadingPosts = true;
    this.loadPostsWithPagination(this.currentStartIndex, this.currentEndIndex, true);
  }

  loadPostsWithPagination(startIndex: number, endIndex: number, isInitialLoad: boolean = false): void {
    if (!this.userId) {
      console.error('User ID not available for loading posts');
      return;
    }

    if (!isInitialLoad) {
      this.loadingMorePosts = true;
    }

    this.postService.getPostSummary(this.userId, startIndex, endIndex).subscribe({
      next: (response: PostSummaryResponse) => {
        console.log('Post summary loaded:', response);
        
        // Update stats only on initial load
        if (isInitialLoad) {
          this.stats.posts = response.totalCount || 0;
        }
        
        // Append new posts to existing posts
        if (response.posts && response.posts.length > 0) {
          this.posts = [...this.posts, ...response.posts];
          
          // Load thumbnails for newly loaded posts
          this.loadPostThumbnailsForPosts(response.posts);
        }
        
        // Update pagination state from response
        this.hasMorePosts = response.hasMore || false;
        this.currentStartIndex = response.startIndex;
        this.currentEndIndex = response.endIndex;
        
        this.loadingPosts = false;
        this.loadingMorePosts = false;

        // Ensure scroll listener is set up after posts are loaded
        setTimeout(() => {
          if (!this.scrollListener) {
            this.setupScrollListener();
          }
          // Check if we need to load more (user might be at bottom)
          this.checkIfNeedMorePosts();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loadingPosts = false;
        this.loadingMorePosts = false;
        if (isInitialLoad) {
          this.showToastMessage('Failed to load posts. Please try again.');
        }
      }
    });
  }

  loadMorePosts(): void {
    if (!this.hasMorePosts || this.loadingMorePosts || !this.userId || this.loadingPosts) {
      return;
    }

    // Calculate new endIndex based on scroll speed
    // Faster scroll = load more posts at once
    const baseLoadSize = 10; // Base number of posts to load
    const speedMultiplier = Math.min(Math.max(this.scrollSpeed / 100, 0.5), 3); // Between 0.5x and 3x
    const loadSize = Math.round(baseLoadSize * speedMultiplier);
    
    const newStartIndex = this.currentEndIndex + 1;
    const newEndIndex = newStartIndex + loadSize - 1;

    console.log(`Loading more posts: ${newStartIndex} to ${newEndIndex} (scroll speed: ${this.scrollSpeed.toFixed(2)} px/s, load size: ${loadSize})`);
    
    this.loadPostsWithPagination(newStartIndex, newEndIndex, false);
  }

  setupScrollListener(): void {
    // If listener already exists, don't set it up again
    if (this.scrollListener) {
      return;
    }

    // Listen to scroll events on the main content area only
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    
    if (!mainContent) {
      console.warn('Main content element not found for scroll listener');
      return;
    }

    this.scrollListener = () => {
      const currentScrollTop = mainContent.scrollTop;
      const scrollHeight = mainContent.scrollHeight;
      const clientHeight = mainContent.clientHeight;
      
      const currentTime = Date.now();
      const timeDelta = (currentTime - this.lastScrollTime) / 1000; // Convert to seconds
      
      if (timeDelta > 0) {
        const scrollDelta = Math.abs(currentScrollTop - this.lastScrollTop);
        this.scrollSpeed = scrollDelta / timeDelta;
      }
      
      this.lastScrollTop = currentScrollTop;
      this.lastScrollTime = currentTime;

      // Check if user is near the bottom (within 300px for better detection)
      const scrollBottom = scrollHeight - clientHeight - currentScrollTop;

      // Only log occasionally to avoid console spam
      if (Math.random() < 0.1) { // Log 10% of scroll events
        console.log('Scroll event:', {
          scrollTop: currentScrollTop.toFixed(2),
          scrollHeight,
          clientHeight,
          scrollBottom: scrollBottom.toFixed(2),
          hasMore: this.hasMorePosts,
          loadingMore: this.loadingMorePosts,
          loading: this.loadingPosts
        });
      }

      if (scrollBottom < 300 && this.hasMorePosts && !this.loadingMorePosts && !this.loadingPosts) {
        console.log('Triggering load more posts - scrollBottom:', scrollBottom.toFixed(2));
        // Clear any existing timeout
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        
        // Debounce the load more call
        this.scrollTimeout = setTimeout(() => {
          this.loadMorePosts();
        }, 200);
      }
    };

    mainContent.addEventListener('scroll', this.scrollListener, { passive: true });
    console.log('Scroll listener attached to main-content', {
      scrollHeight: mainContent.scrollHeight,
      clientHeight: mainContent.clientHeight,
      scrollTop: mainContent.scrollTop
    });
    
    // Test if element is scrollable
    const isScrollable = mainContent.scrollHeight > mainContent.clientHeight;
    console.log('Main content is scrollable:', isScrollable);
  }

  checkIfNeedMorePosts(): void {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    
    if (!mainContent) {
      return;
    }

    const currentScrollTop = mainContent.scrollTop;
    const scrollHeight = mainContent.scrollHeight;
    const clientHeight = mainContent.clientHeight;
    const scrollBottom = scrollHeight - clientHeight - currentScrollTop;

    console.log('Checking if need more posts:', {
      scrollBottom: scrollBottom.toFixed(2),
      hasMore: this.hasMorePosts,
      loadingMore: this.loadingMorePosts,
      loading: this.loadingPosts
    });

    if (scrollBottom < 300 && this.hasMorePosts && !this.loadingMorePosts && !this.loadingPosts) {
      console.log('Already at bottom after loading, fetching more posts...');
      this.loadMorePosts();
    }
  }

  loadPostThumbnails(): void {
    this.posts.forEach((post) => {
      if (post.imageUrls && post.imageUrls.length > 0) {
        const firstImageUrl = post.imageUrls[0];
        // Only load if not already loaded
        if (!this.postThumbnails[post.postId]) {
          this.loadImageAsBase64(firstImageUrl, post.postId);
        }
      }
    });
  }

  loadPostThumbnailsForPosts(posts: Post[]): void {
    posts.forEach((post) => {
      if (post.imageUrls && post.imageUrls.length > 0) {
        const firstImageUrl = post.imageUrls[0];
        // Only load if not already loaded
        if (!this.postThumbnails[post.postId]) {
          this.loadImageAsBase64(firstImageUrl, post.postId);
        }
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
    
    // Reload posts after a short delay (reset to initial load)
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
