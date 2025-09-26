import { IResourceEntity } from "@endo4life/feature-resources";
import { ReactNode } from "react";

interface IPreviewCardProps {
  previewResource: IResourceEntity;
  title: ReactNode;
  subTitle: ReactNode;
  extraInfo: ReactNode;
}

function PreviewCard({
  previewResource,
  title,
  subTitle,
  extraInfo,
}: IPreviewCardProps) {
  return (
    <div className="flex w-full gap-3 lg:w-100">
      {/* left */}
      <div className="">
        <div className="overflow-hidden bg-black rounded-lg justify-items-center min-w-44 max-w-44">
          <img
            alt="preview-image"
            className="object-cover h-28 w-44"
            src={previewResource.thumbnailUrl}
          />
        </div>
      </div>
      {/* right */}
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          {title}
          {subTitle}
          {/* <span className="font-semibold text-md">{title}</span>
          <span className="text-sm text-slate-500">{subTitle}</span> */}
        </div>
        {/* {extraInfo} */}
        <span className="py-3">{extraInfo}</span>
      </div>
    </div>
  )
}

export {
  PreviewCard,
}