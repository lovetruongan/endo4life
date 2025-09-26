import { IMediaGalleryItem } from "@endo4life/types";
import { useRef } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { MdOpenInFull } from "react-icons/md";

interface IMediaGalleryItemProps {
  item: IMediaGalleryItem;
  hasRemoveIcon?: boolean;
  hasZoomIcon?: boolean;
  onRemovePreviewClick?: (item: IMediaGalleryItem) => void;
}

export function MediaGalleryItem({
  item,
  hasRemoveIcon,
  hasZoomIcon,
  onRemovePreviewClick,
}: IMediaGalleryItemProps) {
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative group"
    >
      {hasRemoveIcon && (
        <button
          title="remove-button"
          type="button"
          className="absolute hidden p-1 text-red-500 transition bg-white rounded-full pointer-events-auto hover:text-white hover:bg-red-500 top-3 right-3 group-hover:block"
          onClick={(event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            onRemovePreviewClick && onRemovePreviewClick(item);
          }}
        >
          <IoCloseSharp size={12} />
        </button>
      )}
      {hasZoomIcon && (
        <button
          title="zoom-button"
          type="button"
          className="absolute hidden p-1 text-gray-600 transition transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full top-1/2 left-1/2 group-hover:block"
          onClick={() => {
            if (divRef.current) {
              divRef.current.click();
            }
          }}
        >
          <MdOpenInFull size={16} />
        </button>
      )}
      <div
        key={item.id}
        ref={divRef}
        data-lg-size={item.size}
        className="overflow-hidden rounded-lg slideshow-selector"
        data-src={item.src}
      >
        <img
          title="thumb"
          className="img-responsive max-h-32 gallery-item"
          src={item.thumb}
        />
      </div>
    </div>
  );
}
