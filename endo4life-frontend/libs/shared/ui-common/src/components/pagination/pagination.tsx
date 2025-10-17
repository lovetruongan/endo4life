import { useMemo } from 'react';
import MUIPagination from '@mui/material/Pagination';
import { IOption, IPagination } from '@endo4life/types';
import { formatNumber } from '@endo4life/util-common';
import { FormInputSelect } from '../form';
import { createTheme, ThemeProvider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE_OPTIONS = [5, 10, 12, 15, 20, 25, 50, 75, 100];

const theme = createTheme({
  palette: {
    primary: {
      main: '#403b70',
    },
  },
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#403b70',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#534c8a',
            },
          },
        },
        outlined: {
          '&.Mui-selected': {
            border: 'none',
          },
        },
      },
    },
  },
});

export interface Props {
  pageSizeOptions?: number[];
  pagination: IPagination;
  onPageChange?(page: number): void;
  onPageSizeChange?(page: number): void;
  isShowFullPagination?: boolean;
}

export function Pagination({
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  pagination,
  onPageChange,
  onPageSizeChange,
  isShowFullPagination = false,
}: Props) {
  const { t } = useTranslation("common");
  const options = useMemo<IOption[]>(() => {
    return pageSizeOptions.map((val) => ({
      label: val.toString(),
      value: val.toString(),
    }));
  }, [pageSizeOptions]);
  const { page, size, totalCount } = pagination;
  const pageItems = useMemo(() => {
    const pageOffset = totalCount % size > 0 ? 1 : 0;
    const pageCount = Math.floor(totalCount / size) + pageOffset;
    const items = [];
    for (let i = 0; i < pageCount; i++) items.push(i + 1);
    return items;
  }, [size, totalCount]);

  const handleOnChange = (val: string) => {
    if (!val) return;
    onPageSizeChange && onPageSizeChange(parseInt(val));
  };

  const min = (page - 1) * size + (totalCount > 0 ? 1 : 0);
  const max = Math.min(page * size, totalCount);
  const minToMaxText = `${formatNumber(min)}-${formatNumber(max)}/${formatNumber(totalCount)}`;

  return (
    <div className="items-center block gap-4 px-4 py-2 text-gray-900 bg-white border rounded-md md:flex dark:text-white">
      <div className="flex items-center gap-1">
        <FormInputSelect
          clearable={false}
          value={pagination.size.toString()}
          options={options}
          onChange={handleOnChange}
        />
        <span className="px-2 text-neutral-text">
          {t("pagination.txtLabel").replace("{{RANGE}}", minToMaxText)}
        </span>
      </div>
      <span className="flex-auto" />
      <div className="flex items-center gap-4 py-2">
        <ThemeProvider theme={theme}>
          <MUIPagination
            className="order-2"
            count={pageItems.length}
            page={page}
            variant="outlined"
            shape="rounded"
            color="primary"
            onChange={(_, newPage) => onPageChange && onPageChange(newPage - 1)}
            showFirstButton={isShowFullPagination}
            showLastButton={isShowFullPagination}
          />
        </ThemeProvider>
      </div>
    </div>
  );
}

export default Pagination;
