import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PostService, Post } from '../../services/post.service';

@Component({
  selector: 'app-post-viewer',
  templateUrl: './post-viewer.component.html',
  styleUrls: ['./post-viewer.component.css'],
  standalone: false
})
export class PostViewerComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() post: Post | null = null;
  @Input() thumbnail: string | null = null; // Thumbnail for first image (already loaded)
  @Output() close = new EventEmitter<void>();

  currentImageIndex: number = 0;
  currentImageUrl: string | null = null;
  loadingImage: boolean = false;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    if (this.show && this.post) {
      this.loadCurrentImage();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue && this.post) {
      this.currentImageIndex = 0;
      this.loadCurrentImage();
    }
    if (changes['post'] && this.post && this.show) {
      this.currentImageIndex = 0;
      this.loadCurrentImage();
    }
  }

  loadCurrentImage(): void {
    if (!this.post || !this.post.imageUrls || this.post.imageUrls.length === 0) {
      return;
    }

    // If it's the first image (index 0) and we have a thumbnail, use it directly
    if (this.currentImageIndex === 0 && this.thumbnail) {
      this.currentImageUrl = this.thumbnail;
      this.loadingImage = false;
      return;
    }

    // Otherwise, load the image via API
    this.loadingImage = true;
    const imageUrl = this.post.imageUrls[this.currentImageIndex];
    
    this.postService.getImage(imageUrl).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.currentImageUrl = reader.result as string;
          this.loadingImage = false;
        };
        reader.readAsDataURL(blob);
      },
      error: (error) => {
        console.error('Error loading image:', error);
        this.loadingImage = false;
      }
    });
  }

  nextImage(): void {
    if (!this.post || !this.post.imageUrls) {
      return;
    }

    if (this.currentImageIndex < this.post.imageUrls.length - 1) {
      this.currentImageIndex++;
      this.loadCurrentImage();
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.loadCurrentImage();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  hasMultipleImages(): boolean {
    return this.post ? (this.post.imageUrls && this.post.imageUrls.length > 1) : false;
  }

  formatDate(dateString: string): Date {
    // Convert "2026-01-01 09:33:15.0" to Date object
    // Remove the .0 at the end if present
    const cleaned = dateString.replace(/\.0$/, '');
    return new Date(cleaned);
  }
}
