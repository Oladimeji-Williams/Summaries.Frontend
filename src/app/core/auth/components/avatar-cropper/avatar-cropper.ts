import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';

export interface CropResult {
  readonly blob: Blob;
}

@Component({
  selector: 'app-avatar-cropper',
  imports: [],
  templateUrl: './avatar-cropper.html',
  styleUrl: './avatar-cropper.scss',
})
export class AvatarCropper {
  readonly file = input.required<File>();
  readonly cropped = output<CropResult>();
  readonly cancelled = output<void>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly zoom = signal(1);
  protected readonly minZoom = signal(0.1);
  protected readonly maxZoom = signal(3);
  protected readonly ready = signal(false);

  private image: HTMLImageElement | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  private readonly viewportSize = 280;

  constructor() {
    effect(() => {
      const file = this.file();
      const canvas = this.canvasRef();
      if (!file || !canvas) return;
      this.loadFile(file);
    });
  }

  private loadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.image = img;

        // The image must always cover the circular viewport, so the
        // minimum zoom is whatever scale makes the shorter side exactly
        // fill it — anything smaller would leave gaps in the crop.
        const coverScale = this.viewportSize / Math.min(img.width, img.height);
        this.minZoom.set(coverScale);
        this.maxZoom.set(coverScale * 4);

        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom.set(coverScale);
        this.ready.set(true);
        this.draw();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onZoomChange(value: string): void {
    this.zoom.set(Number(value));
    this.draw();
  }

  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.dragStartX = event.clientX - this.offsetX;
    this.dragStartY = event.clientY - this.offsetY;
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    this.offsetX = event.clientX - this.dragStartX;
    this.offsetY = event.clientY - this.dragStartY;
    this.draw();
  }

  onPointerUp(): void {
    this.dragging = false;
  }

  private draw(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
    const ctx = canvasEl?.getContext('2d');
    if (!ctx || !this.image || !canvasEl) return;

    canvasEl.width = this.viewportSize;
    canvasEl.height = this.viewportSize;
    ctx.clearRect(0, 0, this.viewportSize, this.viewportSize);

    const scale = this.zoom();
    const drawWidth = this.image.width * scale;
    const drawHeight = this.image.height * scale;
    const baseX = (this.viewportSize - drawWidth) / 2 + this.offsetX;
    const baseY = (this.viewportSize - drawHeight) / 2 + this.offsetY;

    ctx.drawImage(this.image, baseX, baseY, drawWidth, drawHeight);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(this.viewportSize / 2, this.viewportSize / 2, this.viewportSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  save(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
    if (!canvasEl) return;
    canvasEl.toBlob((blob) => {
      if (blob) {
        this.cropped.emit({ blob });
      }
    }, 'image/png');
  }

  cancel(): void {
    this.cancelled.emit();
  }
}