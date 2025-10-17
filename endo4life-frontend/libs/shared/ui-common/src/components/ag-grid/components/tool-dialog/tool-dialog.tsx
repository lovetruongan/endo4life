import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, InputLabel } from '@mui/material';
import ColumnTool from "../column-tool/column-tool";
import { useTranslation } from "react-i18next";
import { DialogCloseReason as CloseReason } from "@endo4life/types";
import { GridColDef } from "@endo4life/types";
import { useToggle } from "ahooks";
import { Button } from "../../../button/button";

interface IToolDialogProps<T> {
  open: boolean;
  columns: GridColDef<T>[],
  onClose: () => void;
  onSubmit: (cols: GridColDef<T>[]) => void;
}

function ToolDialog<T>({
  open,
  columns,
  onClose,
  onSubmit,
}: IToolDialogProps<T>) {
  const { t } = useTranslation(["common"]);
  const unacceptableDialogClose: CloseReason[] = [];
  const [cols, setCols] = useState(columns);
  const [isUnacceptable, unacceptableToggle] = useToggle(false);

  const handleOnSubmit = (cols: GridColDef<T>[]) => {
    if (isUnacceptable) {
      return;
    }
    onSubmit(cols);
  }

  const handleOnClose = (reason: CloseReason) => {
    if (!unacceptableDialogClose.includes(reason)) {
      onClose();
    }
  }

  const handleChangeCols = (cols: GridColDef<T>[]) => {
    const hiddenCols = cols.filter(col => col.hide).length;
    if (hiddenCols === cols.length) {
      unacceptableToggle.setRight();
      return;
    }
    unacceptableToggle.setLeft();
    setCols(cols);
  }

  return (
    <Dialog
      open={open}
      fullWidth
      onClose={(_, reason) => handleOnClose(reason as CloseReason)}
    >
      <DialogTitle
        className="!px-5 !pt-4 !pb-2"
      >
        <h6
          className="font-semibold"
        >
          {t("common:table.txtSetup")}
        </h6>
      </DialogTitle>
      <DialogContent
        className="!px-6 !py-1"
      >
        <div
          className="flex flex-col gap-3"
        >
          <div
            className="flex flex-col gap-3"
          >
            <div className="flex flex-row items-center justify-between">
              <InputLabel sx={{ fontWeight: "bold" }}>{t("common:table.tools.txtArrangementAndVisibility")}</InputLabel>
            </div>
            <ColumnTool
              columns={cols}
              onChangeColumns={handleChangeCols}
            />
            {isUnacceptable && (
              <span className="px-1 text-red-600">
                {t("common:table.tools.txtAllFieldsDeselectedWarning")}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogActions
        className="!p-4 gap-2"
      >
        <Button
          onClick={() => handleOnClose(CloseReason.CLOSE_BUTTON_CLICK)}
          variant="text"
        >
          {t("common:txtCancel")}
        </Button>
        <Button
          disabled={isUnacceptable}
          onClick={() => handleOnSubmit(cols)}
        >
          {t("common:txtAgree")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ToolDialog;