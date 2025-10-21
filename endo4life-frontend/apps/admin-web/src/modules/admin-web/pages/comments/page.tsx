import {
  BaseApi,
  CommentV1Api,
  CommentResponseDto,
  CommentCriteria,
  ResourceV1Api,
  CourseV1Api,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { Button, PageHeader, Pagination } from '@endo4life/ui-common';
import { formatNumber } from '@endo4life/util-common';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Autocomplete,
} from '@mui/material';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscRefresh, VscTrash } from 'react-icons/vsc';
import { IoMdEye } from 'react-icons/io';
import { MdFilterList } from 'react-icons/md';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import moment from 'moment';

// Helper class for API calls
class AdminCommentApi extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  async getApi() {
    const config = await this.getApiConfiguration();
    return new CommentV1Api(config);
  }

  async getResourceApi() {
    const config = await this.getApiConfiguration();
    return new ResourceV1Api(config);
  }

  async getCourseApi() {
    const config = await this.getApiConfiguration();
    return new CourseV1Api(config);
  }
}

interface FilterState {
  resourceId?: string;
  courseId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export default function CommentsPage() {
  const { t } = useTranslation(['common']);
  const gridRef = useRef<AgGridReact>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selectedComment, setSelectedComment] =
    useState<CommentResponseDto | null>(null);
  const [openDetailsDialog, openDetailsDialogAction] = useToggle(false);
  const [openDeleteDialog, openDeleteDialogAction] = useToggle(false);
  const [openFilterDialog, openFilterDialogAction] = useToggle(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [tempFilters, setTempFilters] = useState<FilterState>({});

  // Build criteria from filters
  const criteria: CommentCriteria = useMemo(() => {
    const crit: CommentCriteria = {};
    if (filters.resourceId) crit.resourceId = filters.resourceId;
    if (filters.courseId) crit.courseId = filters.courseId;
    return crit;
  }, [filters]);

  // Fetch comments
  const {
    data: commentsData,
    isLoading: loadingComments,
    refetch,
  } = useQuery(
    ['admin-comments', page, size, criteria],
    async () => {
      const api = new AdminCommentApi();
      const commentApi = await api.getApi();
      const response = await commentApi.getComments({
        criteria,
        pageable: {
          page,
          size,
          sort: ['createdAt,desc'],
        },
      });
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch resources for filter
  const { data: resourcesData } = useQuery(
    ['resources-for-filter'],
    async () => {
      const api = new AdminCommentApi();
      const resourceApi = await api.getResourceApi();
      const response = await resourceApi.getResources({
        criteria: {},
        pageable: { page: 0, size: 100 },
      });
      return response.data.data || [];
    },
    { refetchOnWindowFocus: false },
  );

  // Fetch courses for filter
  const { data: coursesData } = useQuery(
    ['courses-for-filter'],
    async () => {
      const api = new AdminCommentApi();
      const courseApi = await api.getCourseApi();
      const response = await courseApi.getCourses({
        criteria: {},
        pageable: { page: 0, size: 100 },
      });
      return response.data.data || [];
    },
    { refetchOnWindowFocus: false },
  );

  // Delete comment mutation
  const deleteCommentMutation = useMutation(
    async (commentId: string) => {
      const api = new AdminCommentApi();
      const commentApi = await api.getApi();
      await commentApi.deleteComment({ id: commentId });
    },
    {
      onSuccess: () => {
        toast.success('Đã xóa bình luận!', {
          position: 'top-right',
          autoClose: 2000,
        });
        refetch();
        openDeleteDialogAction.setLeft();
        setSelectedComment(null);
      },
      onError: () => {
        toast.error('Xóa bình luận thất bại. Vui lòng thử lại.', {
          position: 'top-right',
          autoClose: 3000,
        });
      },
    },
  );

  const handleDeleteComment = () => {
    if (!selectedComment || !selectedComment.id) {
      return;
    }
    deleteCommentMutation.mutate(selectedComment.id);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(0);
    openFilterDialogAction.setLeft();
  };

  const handleClearFilters = () => {
    setFilters({});
    setTempFilters({});
    setPage(0);
    openFilterDialogAction.setLeft();
  };

  const columnDefs: ColDef<CommentResponseDto>[] = useMemo(
    () => [
      {
        headerName: 'Nội dung bình luận',
        field: 'content',
        flex: 2,
        minWidth: 300,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          const content = params.value || '';
          return (
            <div className="py-2">
              <div className="line-clamp-2">{content}</div>
            </div>
          );
        },
      },
      {
        headerName: 'Người bình luận',
        field: 'createdByInfo',
        flex: 1,
        minWidth: 150,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueGetter: (params: any) => {
          const info = params.data?.createdByInfo;
          return info
            ? `${info.firstName || ''} ${info.lastName || ''}`.trim()
            : params.data?.createdBy || 'N/A';
        },
      },
      {
        headerName: 'Số lượng phản hồi',
        field: 'replies',
        width: 150,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueGetter: (params: any) => {
          return params.data?.replies?.length || 0;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          const count = params.value || 0;
          return (
            <Chip
              label={`${count} phản hồi`}
              size="small"
              color={count > 0 ? 'primary' : 'default'}
              variant="outlined"
            />
          );
        },
      },
      {
        headerName: 'Đính kèm',
        field: 'attachments',
        width: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          const count = params.value?.length || 0;
          if (count === 0) return <span className="text-gray-400">Không</span>;
          return (
            <Chip
              label={`${count} file`}
              size="small"
              color="info"
              variant="outlined"
            />
          );
        },
      },
      {
        headerName: 'Ngày tạo',
        field: 'createdAt',
        width: 180,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueFormatter: (params: any) => {
          return params.value
            ? moment(params.value).format('DD/MM/YYYY HH:mm')
            : 'N/A';
        },
      },
      {
        headerName: 'Hành động',
        field: 'id',
        width: 150,
        pinned: 'right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center gap-2 h-full">
              <Tooltip title="Xem chi tiết">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedComment(params.data);
                    openDetailsDialogAction.setRight();
                  }}
                >
                  <IoMdEye />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa bình luận">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setSelectedComment(params.data);
                    openDeleteDialogAction.setRight();
                  }}
                >
                  <VscTrash />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [openDetailsDialogAction, openDeleteDialogAction],
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPage(0);
    setSize(newSize);
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderCommentTree = (comment: CommentResponseDto, level = 0) => {
    return (
      <div key={comment.id} className={`${level > 0 ? 'ml-8 mt-3' : 'mt-3'}`}>
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.createdByInfo
                  ? `${comment.createdByInfo.firstName || ''} ${comment.createdByInfo.lastName || ''}`.trim()
                  : comment.createdBy || 'N/A'}
              </span>
              {comment.createdByInfo?.email && (
                <span className="text-xs text-gray-500">
                  ({comment.createdByInfo.email})
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {comment.createdAt
                ? moment(comment.createdAt).format('DD/MM/YYYY HH:mm')
                : ''}
            </span>
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {comment.attachments.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  <span role="img" aria-label="attachment">
                    📎
                  </span>{' '}
                  Đính kèm {index + 1}
                </a>
              ))}
            </div>
          )}
        </div>
        {comment.replies &&
          comment.replies.length > 0 &&
          comment.replies.map((reply) => renderCommentTree(reply, level + 1))}
      </div>
    );
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Quản lý bình luận"
        titleAction={
          <div className="flex gap-2">
            <Tooltip title="Lọc" arrow>
              <span>
                <IconButton onClick={() => openFilterDialogAction.setRight()}>
                  <div className="relative">
                    <MdFilterList />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </div>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('common:txtRefresh')} arrow>
              <span>
                <IconButton onClick={handleRefresh}>
                  <VscRefresh />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        }
      />

      <div className="flex-1 px-4 pb-4">
        <div className="h-full ag-theme-alpine">
          <AgGridReact
            ref={gridRef}
            rowData={commentsData?.data || []}
            columnDefs={columnDefs}
            loading={loadingComments}
            domLayout="normal"
            rowHeight={60}
            headerHeight={48}
            pagination={false}
            suppressPaginationPanel={true}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-gray-700">
          Hiển thị {formatNumber(commentsData?.data?.length || 0)} /{' '}
          {formatNumber(commentsData?.total || 0)} bình luận
        </div>
        <Pagination
          pagination={{
            page: page + 1,
            size: size,
            totalCount: commentsData?.total || 0,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => openFilterDialogAction.setLeft()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Lọc bình luận</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <Autocomplete
              options={resourcesData || []}
              getOptionLabel={(option) => option.title || ''}
              value={
                resourcesData?.find((r) => r.id === tempFilters.resourceId) ||
                null
              }
              onChange={(_, newValue) => {
                setTempFilters((prev) => ({
                  ...prev,
                  resourceId: newValue?.id,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Tài nguyên" />
              )}
            />
            <Autocomplete
              options={coursesData || []}
              getOptionLabel={(option) => option.title || ''}
              value={
                coursesData?.find((c) => c.id === tempFilters.courseId) || null
              }
              onChange={(_, newValue) => {
                setTempFilters((prev) => ({
                  ...prev,
                  courseId: newValue?.id,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Khóa học" />
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={handleClearFilters}>
            Xóa bộ lọc
          </Button>
          <Button
            variant="outline"
            onClick={() => openFilterDialogAction.setLeft()}
          >
            Hủy
          </Button>
          <Button variant="fill" onClick={handleApplyFilters}>
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => openDetailsDialogAction.setLeft()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết bình luận</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <strong className="text-sm text-gray-600">
                Người bình luận:
              </strong>
              <p className="mt-1">
                {selectedComment?.createdByInfo
                  ? `${selectedComment.createdByInfo.firstName || ''} ${selectedComment.createdByInfo.lastName || ''}`.trim()
                  : selectedComment?.createdBy || 'N/A'}
              </p>
              {selectedComment?.createdByInfo?.email && (
                <p className="text-sm text-gray-500">
                  {selectedComment.createdByInfo.email}
                </p>
              )}
            </div>
            <div>
              <strong className="text-sm text-gray-600">Ngày tạo:</strong>
              <p className="mt-1">
                {selectedComment?.createdAt
                  ? moment(selectedComment.createdAt).format('DD/MM/YYYY HH:mm')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">
                Cây bình luận và phản hồi:
              </strong>
              {selectedComment && renderCommentTree(selectedComment)}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outline"
            onClick={() => openDetailsDialogAction.setLeft()}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => openDeleteDialogAction.setLeft()}
        maxWidth="sm"
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <p className="mb-3">Bạn có chắc chắn muốn xóa bình luận này không?</p>
          {selectedComment && (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm line-clamp-3 mb-2">
                {selectedComment.content}
              </p>
              {selectedComment.replies &&
                selectedComment.replies.length > 0 && (
                  <p className="text-xs text-orange-600">
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>{' '}
                    Bình luận này có {selectedComment.replies.length} phản hồi
                    sẽ bị xóa cùng
                  </p>
                )}
            </div>
          )}
          <p className="mt-3 text-sm text-red-600 font-medium">
            <span role="img" aria-label="warning">
              ⚠️
            </span>{' '}
            Hành động này không thể hoàn tác!
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outline"
            onClick={() => openDeleteDialogAction.setLeft()}
            disabled={deleteCommentMutation.isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="fill"
            onClick={handleDeleteComment}
            disabled={deleteCommentMutation.isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteCommentMutation.isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
