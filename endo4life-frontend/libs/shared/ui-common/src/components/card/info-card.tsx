import clsx from "clsx";

interface IInfoCardProps {
  label: string;
  content: string;
  gap?: number;
  labelClassName?: string;
  contentClassName?: string;
}

function InfoCard({
  label,
  content,
  gap = 1,
  labelClassName = "text-sm text-neutral-subtle-text",
  contentClassName = "text-neutral-text",
}: IInfoCardProps) {
  return (
    <div
      className={`flex flex-col gap-${gap} w-full`}
    >
      <label
        className={clsx({
          [labelClassName]: true
        })}
      >
        {label}
      </label>
      <span
        className={clsx({
          [contentClassName]: true
        })}
      >
        {content}
      </span>
    </div>
  )
}

export {
  InfoCard,
}