import React from 'react';

interface VideoTagsCellProps {
  tags?: string[] | null;
}

export const VideoTagsCell: React.FC<VideoTagsCellProps> = ({ tags }) => {
  if (!tags || !Array.isArray(tags)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="truncate max-w-[300px] bg-gray-100 text-black text-sm font-medium px-4 py-1 rounded-full"
          title={tag}
        >
          {tag.length > 30 ? `${tag.substring(0, 7)}...` : tag}
        </div>
      ))}
    </div>
  );
};
