import React from "react";
import { useStyles } from "./file-view.styles";
import { inferTypeFromUrl } from "@endo4life/util-common";

export function FileViewer({
  source
}: { source: File; }) {
  const classes = useStyles();
  // Helper to check if the source is a File object
  const isFile = (source: File | string) => source instanceof File;

  // Determine how to render based on the source type
  const renderContent = () => {
    let content;

    if (isFile(source)) {
      // Handle File object: Use object URL
      const url = URL.createObjectURL(source);
      const fileType = source.type;

      content = renderByType(fileType, url);

      // Cleanup object URL after use
      if (/image|video/.test(fileType)) {
        content = React.cloneElement(content, {
          onLoad: () => URL.revokeObjectURL(url),
        });
      }
    } else {
      // Handle URL: Infer content type for known formats or default to image
      const fileType = inferTypeFromUrl(source);
      content = renderByType(fileType, source);
    }

    return content || <p>Preview not available.</p>;
  };

  // Render content by type
  const renderByType = (fileType: string, url: string) => {
    if (fileType.startsWith("image")) {
      return (
        <img src={url} alt="Preview" className={classes.resourceContainer} />
      );
    }

    if (fileType.startsWith("video")) {
      return (
        <video controls className={classes.resourceContainer}>
          <source src={url} type={fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (fileType === "application/pdf") {
      return (
        <div
          style={{
            width: "90vw",
            height: "90vh",
          }}
        >
          <object
            data={url}
            type="application/pdf"
            style={{ width: "100%", height: "100%" }}
          >
            <p>
              <a href={"url"}>download the PDF</a> to view it.
            </p>
          </object>
        </div>
      );
    }

    // Default to image if type is unknown
    return (
      <img src={url} alt="Content" className={classes.resourceContainer} />
    );
  };

  return <div>{renderContent()}</div>;
}
