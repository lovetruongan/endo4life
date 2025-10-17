import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  listAttachmentContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "0px 8px",
  },
  attachmentContainer: {
    gap: "5px",
    position: "relative",
    marginBottom: "10px",
    padding: "25px 10pxß",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  dialog: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    zIndex: "10002 !important",
    position: "fixed",
  },
  fileName: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
    textAlign: "center",
  },
}));
