import React from 'react';

interface ImageTagsCellProps {
  tags: string[];
}

export function ImageTagsCell({ tags }: ImageTagsCellProps) {
  return (
    <div className="flex items-center flex-wrap gap-1 my-4">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="bg-gray-100 text-black text-sm font-medium px-4 py-1 rounded-full"
        >
          {tag}
        </div>
      ))}
    </div>
  );
}
