import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
  standalone: false
})
export class CreatePostComponent implements OnInit {
  @Input() userId: string = '';
  @Input() show: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<void>();

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  caption: string = '';
  uploadError: string = '';
  isUploading: boolean = false;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.caption = '';
    this.uploadError = '';
    this.isUploading = false;
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.uploadError = '';

    // Check total files count (including already selected)
    const totalFiles = this.selectedFiles.length + files.length;
    if (totalFiles > 6) {
      this.uploadError = 'Maximum 6 images allowed. Please select fewer images.';
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} is not an image file.`);
        return;
      }

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} exceeds 2MB limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      this.uploadError = invalidFiles.join(' ');
    }

    // Add valid files
    this.selectedFiles = [...this.selectedFiles, ...validFiles];

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.uploadError = '';
  }

  sharePost(): void {
    // Validation
    if (this.selectedFiles.length === 0) {
      this.uploadError = 'Please select at least 1 image.';
      return;
    }

    if (this.selectedFiles.length > 6) {
      this.uploadError = 'Maximum 6 images allowed.';
      return;
    }

    if (!this.userId) {
      this.uploadError = 'User ID not found. Please login again.';
      console.error('User ID not found. User data:', localStorage.getItem('currentUser'));
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    this.postService.createPost(this.selectedFiles, this.caption, this.userId).subscribe({
      next: (response) => {
        console.log('Post created successfully:', response);
        this.isUploading = false;
        this.resetForm();
        this.postCreated.emit();
        this.onClose();
      },
      error: (error) => {
        console.error('Error creating post:', error);
        this.isUploading = false;
        this.uploadError = error.error?.message || 'Failed to share post. Please try again.';
      }
    });
  }
}

