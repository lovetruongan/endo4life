export interface IMediaGalleryItem {
  id: string | number;
  src: string;
  thumb: string;
  alt?: string;
  size?: string;  // 720-1080
  subHtml?: string  // <div class="lightGallery-captions"><p>Published on November 13, 2018</p></div>
}