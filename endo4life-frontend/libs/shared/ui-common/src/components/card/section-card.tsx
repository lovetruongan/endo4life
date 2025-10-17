import IconButton from "@mui/material/IconButton";
import React from "react";
import { ReactNode, useEffect, useState } from "react";
import { VscChevronDown, VscChevronUp, VscChromeClose } from "react-icons/vsc";

interface Props {
  children?: ReactNode;
  title?: string;
  className?: string;
  actions?: ReactNode;
  expandable?: boolean;
  expanded?: boolean;
  onClose?(): void;
}
export function SectionCard({
  children,
  title,
  className = "p-6 space-y-4 bg-white rounded",
  actions,
  expandable = true,
  expanded = true,
  onClose,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  useEffect(() => setIsExpanded(expanded), [expanded]);
  return (
    <section className={className}>
      {title && (
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-tertiary">{title}</h3>
          <span className="flex-auto" />
          {actions}
          {expandable && (
            <IconButton
              className="flex-none"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                setIsExpanded((pre) => !pre);
              }}
            >
              {isExpanded && <VscChevronDown size={18} />}
              {!isExpanded && <VscChevronUp size={18} />}
            </IconButton>
          )}
          {onClose && (
            <IconButton onClick={onClose}>
              <VscChromeClose size={18} />
            </IconButton>
          )}
        </div>
      )}
      {isExpanded && children}
    </section>
  );
}

export default SectionCard;
