import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PostService } from '../../services/post.service';

// Standard square size for all images
const IMAGE_SIZE = 1000; // 1000x1000 pixels

interface ImageData {
  originalFile: File;
  croppedDataUrl: string;
  croppedFile: File | null;
}

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
  imageData: ImageData[] = [];
  imagePreviews: string[] = [];
  originalImageDataUrls: string[] = []; // Store original image data URLs for cropping
  caption: string = '';
  uploadError: string = '';
  isUploading: boolean = false;
  
  // Cropping state
  showCropModal: boolean = false;
  currentCropIndex: number = -1;
  cropImage: HTMLImageElement | null = null;
  cropCanvas: HTMLCanvasElement | null = null;
  cropCtx: CanvasRenderingContext2D | null = null;
  cropX: number = 0;
  cropY: number = 0;
  cropSize: number = 0;
  imageScale: number = 1;
  imageOffsetX: number = 0;
  imageOffsetY: number = 0;
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.selectedFiles = [];
    this.imageData = [];
    this.imagePreviews = [];
    this.originalImageDataUrls = [];
    this.caption = '';
    this.uploadError = '';
    this.isUploading = false;
    this.showCropModal = false;
    this.currentCropIndex = -1;
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.uploadError = '';

    // Reset the input value so the change event fires again on next selection
    if (event.target) {
      event.target.value = '';
    }

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

    // Add valid files and auto-crop each to square
    validFiles.forEach((file) => {
      this.selectedFiles.push(file);
      const index = this.imageData.length;
      
      // Add placeholder immediately for instant feedback
      this.imageData.push({
        originalFile: file,
        croppedDataUrl: '',
        croppedFile: null
      });
      this.imagePreviews.push(''); // Placeholder
      this.originalImageDataUrls.push(''); // Placeholder
      
      // Trigger change detection to show the new slot immediately
      this.cdr.detectChanges();
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl = e.target.result;
        this.originalImageDataUrls[index] = dataUrl; // Store original
        // Auto-crop to square (center crop)
        this.autoCropToSquare(index, dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  autoCropToSquare(index: number, imageDataUrl: string): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = IMAGE_SIZE;
      canvas.height = IMAGE_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Calculate square crop from center
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      ctx.drawImage(img, x, y, size, size, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], this.imageData[index].originalFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        this.imageData[index].croppedDataUrl = dataUrl;
        this.imageData[index].croppedFile = file;
        this.imagePreviews[index] = dataUrl;
        
        // Trigger change detection to update the view
        this.cdr.detectChanges();
      }, 'image/jpeg', 0.9);
    };
    img.src = imageDataUrl;
  }

  openCropModal(index: number, currentPreview: string): void {
    this.currentCropIndex = index;
    this.showCropModal = true;
    
    // Use original image for cropping, not the cropped version
    const originalDataUrl = this.originalImageDataUrls[index] || currentPreview;
    
    // Wait for view to update, then initialize crop
    setTimeout(() => {
      this.initializeCrop(originalDataUrl);
    }, 100);
  }

  initializeCrop(imageDataUrl: string): void {
    const canvas = document.getElementById('cropCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    this.cropCanvas = canvas;
    this.cropCtx = canvas.getContext('2d');
    if (!this.cropCtx) return;

    const img = new Image();
    img.onload = () => {
      this.cropImage = img;
      
      // Set canvas size (display size)
      const displaySize = 600; // Display size for cropping UI
      canvas.width = displaySize;
      canvas.height = displaySize;
      
      // Calculate scale to fit image in canvas
      const imgAspect = img.width / img.height;
      let drawWidth = displaySize;
      let drawHeight = displaySize;
      
      if (imgAspect > 1) {
        // Landscape
        drawHeight = displaySize / imgAspect;
      } else {
        // Portrait or square
        drawWidth = displaySize * imgAspect;
      }
      
      this.imageScale = Math.min(img.width / drawWidth, img.height / drawHeight);
      this.imageOffsetX = (displaySize - drawWidth) / 2;
      this.imageOffsetY = (displaySize - drawHeight) / 2;
      
      // Initialize crop area (square, centered, 80% of canvas)
      this.cropSize = displaySize * 0.8;
      this.cropX = (displaySize - this.cropSize) / 2;
      this.cropY = (displaySize - this.cropSize) / 2;
      
      this.drawCropCanvas();
    };
    img.src = imageDataUrl;
  }

  drawCropCanvas(): void {
    if (!this.cropCanvas || !this.cropCtx || !this.cropImage) return;

    const ctx = this.cropCtx;
    const canvas = this.cropCanvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    const imgAspect = this.cropImage.width / this.cropImage.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    
    if (imgAspect > 1) {
      drawHeight = canvas.width / imgAspect;
    } else {
      drawWidth = canvas.height * imgAspect;
    }
    
    ctx.drawImage(
      this.cropImage,
      this.imageOffsetX,
      this.imageOffsetY,
      drawWidth,
      drawHeight
    );
    
    // Draw overlay (darken outside crop area)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(this.cropX, this.cropY, this.cropSize, this.cropSize);
    
    // Draw crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.cropX, this.cropY, this.cropSize, this.cropSize);
    
    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#fff';
    // Top-left
    ctx.fillRect(this.cropX - handleSize/2, this.cropY - handleSize/2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(this.cropX + this.cropSize - handleSize/2, this.cropY - handleSize/2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(this.cropX - handleSize/2, this.cropY + this.cropSize - handleSize/2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(this.cropX + this.cropSize - handleSize/2, this.cropY + this.cropSize - handleSize/2, handleSize, handleSize);
  }

  onCropMouseDown(event: MouseEvent): void {
    if (!this.cropCanvas) return;
    
    const rect = this.cropCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicking on crop area
    if (x >= this.cropX && x <= this.cropX + this.cropSize &&
        y >= this.cropY && y <= this.cropY + this.cropSize) {
      this.isDragging = true;
      this.dragStartX = x - this.cropX;
      this.dragStartY = y - this.cropY;
    }
  }

  onCropMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.cropCanvas) return;
    
    const rect = this.cropCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Update crop position
    this.cropX = Math.max(0, Math.min(x - this.dragStartX, this.cropCanvas.width - this.cropSize));
    this.cropY = Math.max(0, Math.min(y - this.dragStartY, this.cropCanvas.height - this.cropSize));
    
    this.drawCropCanvas();
  }

  onCropMouseUp(): void {
    this.isDragging = false;
  }

  onCropWheel(event: WheelEvent): void {
    event.preventDefault();
    if (!this.cropCanvas) return;
    
    const delta = event.deltaY > 0 ? -10 : 10;
    const newSize = Math.max(100, Math.min(this.cropCanvas.width * 0.9, this.cropSize + delta));
    
    // Adjust position to keep crop centered
    const sizeDiff = newSize - this.cropSize;
    this.cropSize = newSize;
    this.cropX = Math.max(0, Math.min(this.cropX - sizeDiff / 2, this.cropCanvas.width - this.cropSize));
    this.cropY = Math.max(0, Math.min(this.cropY - sizeDiff / 2, this.cropCanvas.height - this.cropSize));
    
    this.drawCropCanvas();
  }

  applyCrop(): void {
    if (this.currentCropIndex === -1 || !this.cropImage || !this.cropCanvas) return;
    
    // Create a canvas for the cropped image at full resolution
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = IMAGE_SIZE;
    outputCanvas.height = IMAGE_SIZE;
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;
    
    // Calculate source coordinates in original image
    const scaleX = this.cropImage.width / this.cropCanvas.width;
    const scaleY = this.cropImage.height / this.cropCanvas.height;
    
    const sourceX = (this.cropX - this.imageOffsetX) * scaleX;
    const sourceY = (this.cropY - this.imageOffsetY) * scaleY;
    const sourceSize = this.cropSize * Math.max(scaleX, scaleY);
    
    // Draw cropped and resized image
    outputCtx.drawImage(
      this.cropImage,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, IMAGE_SIZE, IMAGE_SIZE
    );
    
    // Convert to blob and file
    outputCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], this.imageData[this.currentCropIndex].originalFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.9);
      
      this.imageData[this.currentCropIndex].croppedDataUrl = dataUrl;
      this.imageData[this.currentCropIndex].croppedFile = file;
      
      // Update preview
      if (this.imagePreviews[this.currentCropIndex]) {
        this.imagePreviews[this.currentCropIndex] = dataUrl;
      } else {
        this.imagePreviews.push(dataUrl);
      }
      
      // Trigger change detection
      this.cdr.detectChanges();
      
      this.closeCropModal();
    }, 'image/jpeg', 0.9);
  }

  closeCropModal(): void {
    this.showCropModal = false;
    this.currentCropIndex = -1;
    this.cropImage = null;
    this.cropCanvas = null;
    this.cropCtx = null;
  }


  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imageData.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.originalImageDataUrls.splice(index, 1);
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

    // Ensure all images are cropped
    const uncropped = this.imageData.findIndex(img => !img.croppedFile);
    if (uncropped !== -1) {
      this.uploadError = 'Please crop all images before sharing.';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    // Use cropped files
    const croppedFiles = this.imageData.map(img => img.croppedFile!);
    this.postService.createPost(croppedFiles, this.caption, this.userId).subscribe({
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

