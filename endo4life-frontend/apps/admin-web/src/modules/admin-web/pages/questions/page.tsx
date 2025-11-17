import {
  BaseApi,
  DoctorUserConversationsV1Api,
  DoctorUserConversationResponseDto,
  DoctorUserConversationState,
  UpdateDoctorUserConversationDto,
  UserInfoRole,
  UserV1Api,
  UserResponseDto,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { Button, PageHeader, Pagination } from '@endo4life/ui-common';
import { formatNumber } from '@endo4life/util-common';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscRefresh } from 'react-icons/vsc';
import { MdAssignmentInd } from 'react-icons/md';
import { IoMdEye } from 'react-icons/io';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import moment from 'moment';

// Helper class for API calls
class AdminDoctorUserConversationApi extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  async getApi() {
    const config = await this.getApiConfiguration();
    return new DoctorUserConversationsV1Api(config);
  }

  async getUserApi() {
    const config = await this.getApiConfiguration();
    return new UserV1Api(config);
  }
}

export default function QuestionsPage() {
  const { t } = useTranslation(['common']);
  const gridRef = useRef<AgGridReact>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selectedConversation, setSelectedConversation] =
    useState<DoctorUserConversationResponseDto | null>(null);
  const [openAssignDialog, openAssignDialogAction] = useToggle(false);
  const [openDetailsDialog, openDetailsDialogAction] = useToggle(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: loadingConversations,
    refetch,
  } = useQuery(
    ['admin-doctor-user-conversations', page, size],
    async () => {
      const api = new AdminDoctorUserConversationApi();
      const doctorUserConversationsApi = await api.getApi();
      const response =
        await doctorUserConversationsApi.getDoctorUserConversations({
          criteria: {},
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

  // Fetch doctors (SPECIALIST role)
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery(
    ['doctors'],
    async () => {
      const api = new AdminDoctorUserConversationApi();
      const userApi = await api.getUserApi();
      const response = await userApi.getUsers({
        criteria: {
          role: UserInfoRole.Specialist,
        },
        pageable: {
          page: 0,
          size: 1000,
        },
      });
      return response.data.data || [];
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Assign doctor mutation
  const assignDoctorMutation = useMutation(
    async ({
      conversationId,
      doctorId,
    }: {
      conversationId: string;
      doctorId: string;
    }) => {
      const api = new AdminDoctorUserConversationApi();
      const doctorUserConversationsApi = await api.getApi();
      const updateData: UpdateDoctorUserConversationDto = {
        assigneeId: doctorId,
      };
      await doctorUserConversationsApi.updateDoctorUserConversation({
        id: conversationId,
        updateDoctorUserConversationDto: updateData,
      });
    },
    {
      onSuccess: () => {
        toast.success('Đã phân công câu hỏi cho bác sĩ!', {
          position: 'top-right',
          autoClose: 2000,
        });
        refetch();
        openAssignDialogAction.setLeft();
        setSelectedConversation(null);
        setSelectedDoctorId('');
      },
      onError: () => {
        toast.error('Phân công thất bại. Vui lòng thử lại.', {
          position: 'top-right',
          autoClose: 3000,
        });
      },
    },
  );

  const handleAssignDoctor = () => {
    if (
      !selectedConversation ||
      !selectedDoctorId ||
      !selectedConversation.id
    ) {
      toast.error('Vui lòng chọn bác sĩ', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    assignDoctorMutation.mutate({
      conversationId: selectedConversation.id,
      doctorId: selectedDoctorId,
    });
  };

  const columnDefs: ColDef<DoctorUserConversationResponseDto>[] = useMemo(
    () => [
      {
        headerName: 'Nội dung câu hỏi',
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
        headerName: 'Người hỏi',
        field: 'questionerInfo',
        flex: 1,
        minWidth: 150,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueGetter: (params: any) => {
          const info = params.data?.questionerInfo;
          return info
            ? `${info.firstName || ''} ${info.lastName || ''}`.trim()
            : 'N/A';
        },
      },
      {
        headerName: 'Bác sĩ được phân công',
        field: 'assigneeInfo',
        flex: 1,
        minWidth: 150,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          const info = params.data?.assigneeInfo;
          if (!info) {
            return <Chip label="Chưa phân công" size="small" color="warning" />;
          }
          return (
            <div>{`${info.firstName || ''} ${info.lastName || ''}`.trim()}</div>
          );
        },
      },
      {
        headerName: 'Trạng thái',
        field: 'state',
        width: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          const state = params.value;
          if (state === DoctorUserConversationState.Public) {
            return <Chip label="Công khai" size="small" color="success" />;
          }
          return <Chip label="Nháp" size="small" color="default" />;
        },
      },
      {
        headerName: 'Loại',
        field: 'type',
        width: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          const type = params.value;
          return <Chip label={type || 'N/A'} size="small" variant="outlined" />;
        },
      },
      {
        headerName: 'Ngày tạo',
        field: 'createdAt',
        width: 150,
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
                    setSelectedConversation(params.data);
                    openDetailsDialogAction.setRight();
                  }}
                >
                  <IoMdEye />
                </IconButton>
              </Tooltip>
              <Tooltip title="Phân công bác sĩ">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedConversation(params.data);
                    setSelectedDoctorId(params.data?.assigneeInfo?.id || '');
                    openAssignDialogAction.setRight();
                  }}
                >
                  <MdAssignmentInd />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [openAssignDialogAction, openDetailsDialogAction],
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Quản lý câu hỏi"
        titleAction={
          <Tooltip title={t('common:txtRefresh')} arrow>
            <span>
              <IconButton onClick={handleRefresh}>
                <VscRefresh />
              </IconButton>
            </span>
          </Tooltip>
        }
      />

      <div className="flex flex-col flex-auto w-full h-1 px-5 overflow-y-auto">
        <div className="ag-theme-alpine" style={{ width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={conversationsData?.data || []}
            columnDefs={columnDefs}
            loading={loadingConversations}
            domLayout="autoHeight"
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
        <Pagination
          pagination={{
            page: page + 1,
            size: size,
            totalCount: conversationsData?.total || 0,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => openDetailsDialogAction.setLeft()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết câu hỏi</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <strong className="text-sm text-gray-600">
                Nội dung câu hỏi:
              </strong>
              <p className="mt-2 text-base">{selectedConversation?.content}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="text-sm text-gray-600">Người hỏi:</strong>
                <p className="mt-1">
                  {selectedConversation?.questionerInfo
                    ? `${selectedConversation.questionerInfo.firstName || ''} ${selectedConversation.questionerInfo.lastName || ''}`.trim()
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedConversation?.questionerInfo?.email || ''}
                </p>
              </div>
              <div>
                <strong className="text-sm text-gray-600">
                  Bác sĩ phụ trách:
                </strong>
                <p className="mt-1">
                  {selectedConversation?.assigneeInfo
                    ? `${selectedConversation.assigneeInfo.firstName || ''} ${selectedConversation.assigneeInfo.lastName || ''}`.trim()
                    : 'Chưa phân công'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedConversation?.assigneeInfo?.email || ''}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <strong className="text-sm text-gray-600">Trạng thái:</strong>
                <p className="mt-1">
                  <Chip
                    label={
                      selectedConversation?.state ===
                      DoctorUserConversationState.Public
                        ? 'Công khai'
                        : 'Nháp'
                    }
                    size="small"
                    color={
                      selectedConversation?.state ===
                      DoctorUserConversationState.Public
                        ? 'success'
                        : 'default'
                    }
                  />
                </p>
              </div>
              <div>
                <strong className="text-sm text-gray-600">Loại:</strong>
                <p className="mt-1">
                  <Chip
                    label={selectedConversation?.type || 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </p>
              </div>
              <div>
                <strong className="text-sm text-gray-600">Ngày tạo:</strong>
                <p className="mt-1">
                  {selectedConversation?.createdAt
                    ? moment(selectedConversation.createdAt).format(
                        'DD/MM/YYYY HH:mm',
                      )
                    : 'N/A'}
                </p>
              </div>
            </div>
            {selectedConversation?.attachmentUrls &&
              selectedConversation.attachmentUrls.length > 0 && (
                <div>
                  <strong className="text-sm text-gray-600">Đính kèm:</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedConversation.attachmentUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="w-32 h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            {selectedConversation?.replies &&
              selectedConversation.replies.length > 0 && (
                <div>
                  <strong className="text-sm text-gray-600">
                    Câu trả lời ({selectedConversation.replies.length}):
                  </strong>
                  <div className="mt-2 space-y-3">
                    {selectedConversation.replies.map((reply, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            {reply.assigneeInfo
                              ? `${reply.assigneeInfo.firstName || ''} ${reply.assigneeInfo.lastName || ''}`.trim()
                              : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {reply.createdAt
                              ? moment(reply.createdAt).format(
                                  'DD/MM/YYYY HH:mm',
                                )
                              : ''}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Assign Doctor Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => openAssignDialogAction.setLeft()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Phân công bác sĩ</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <strong>Câu hỏi:</strong>
              <p className="mt-2 text-sm text-gray-700">
                {selectedConversation?.content}
              </p>
            </div>
            <div>
              <strong>Người hỏi:</strong>
              <p className="mt-1 text-sm">
                {selectedConversation?.questionerInfo
                  ? `${selectedConversation.questionerInfo.firstName || ''} ${selectedConversation.questionerInfo.lastName || ''}`.trim()
                  : 'N/A'}
              </p>
            </div>
            <FormControl fullWidth>
              <InputLabel>Chọn bác sĩ</InputLabel>
              <Select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value as string)}
                label="Chọn bác sĩ"
                disabled={loadingDoctors}
              >
                {doctorsData?.map((doctor: UserResponseDto) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {`${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}{' '}
                    - {doctor.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outline"
            onClick={() => openAssignDialogAction.setLeft()}
            disabled={assignDoctorMutation.isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="fill"
            onClick={handleAssignDoctor}
            disabled={assignDoctorMutation.isLoading || !selectedDoctorId}
          >
            {assignDoctorMutation.isLoading ? 'Đang xử lý...' : 'Phân công'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
