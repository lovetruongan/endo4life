import LightGallery from 'lightgallery/react';

// import styles
import './media-gallery.css';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';

import { IMediaGalleryItem } from "@endo4life/types";
import { useCallback } from "react";
import { MediaGalleryItem } from './media-gallery-item';

interface IMediaGalleryProps {
  data: IMediaGalleryItem[];
  hasRemoveIcon?: boolean;
  hasZoomIcon?: boolean;
  onRemovePreviewClick?: (item: IMediaGalleryItem) => void;
}

export function MediaGallery({
  data = [],
  hasRemoveIcon = false,
  hasZoomIcon = true,
  onRemovePreviewClick,
}: IMediaGalleryProps) {
  const renderItems = useCallback(() => {
    return data.map((item) => {
      return (
        <MediaGalleryItem
          key={item.id}
          item={item}
          hasRemoveIcon={hasRemoveIcon}
          hasZoomIcon={hasZoomIcon}
          onRemovePreviewClick={onRemovePreviewClick}
        />
      );
    });
  }, [data]);

  return (
    <LightGallery
      licenseKey="no-money-no-question-ok"
      plugins={[lgVideo, lgZoom, lgThumbnail]}
      elementClassNames=""
      selector=".slideshow-selector"
    >
      {renderItems()}
    </LightGallery>
  )
}