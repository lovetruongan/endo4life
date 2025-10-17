import { ReactNode } from 'react';
import { ReadMoreWeb } from 'react-shorten';

interface IReadMoreTextProps {
  amountOfWords?: number,
  children: ReactNode,
}

export const ReadMoreText = ({
  amountOfWords = 2000,
  children
}: IReadMoreTextProps) => {
  

  return (
    <ReadMoreWeb
      style={{ textAlign: "left" }}
      truncate={amountOfWords}
      showLessText={(
        <span className="font-semibold text-[#2c224c]">Thu gọn</span>
      )}
      showMoreText={(
        <span className="font-semibold text-[#2c224c]">Xem thêm</span>
      )}
    >
      {children}
    </ReadMoreWeb>
  );
}
