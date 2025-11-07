import { useState, useRef, useEffect } from 'react';
import {
  useCreateCollection,
  useUploadDocuments,
  useTaskStatus,
  useCollections,
  useDocuments,
} from '../hooks';
import { CircularProgress, LinearProgress, Alert, Chip, Card, CardContent, IconButton, Collapse } from '@mui/material';
import { toast } from 'react-toastify';
import { useQueryClient } from 'react-query';
import { 
  PiUploadSimpleFill, 
  PiFilePdfFill, 
  PiTrashFill,
  PiCheckCircleFill,
  PiXCircleFill,
  PiWarningCircleFill,
  PiChatCircleFill,
  PiClockFill,
  PiFileTextFill,
  PiFolderOpenFill,
  PiCaretDownFill,
  PiCaretRightFill
} from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import clsx from 'clsx';
import styles from './RagIngestForm.module.css';

interface TaskState {
  taskId: string;
  status: string;
  message?: string;
  totalDocuments: number;
  uploadedDocuments: number;
  failedDocuments: any[];
  validationErrors: any[];
}

export function RagIngestForm() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collectionName, setCollectionName] = useState('multimodal_data');
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(150);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [taskState, setTaskState] = useState<TaskState | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [viewingCollection, setViewingCollection] = useState<string | null>(null);

  const createCollectionMutation = useCreateCollection();
  const uploadDocumentsMutation = useUploadDocuments();
  const { data: collectionsData, refetch: refetchCollections } = useCollections();
  const { data: documentsData, isLoading: isLoadingDocuments, refetch: refetchDocuments } = useDocuments(viewingCollection);
  
  // Poll task status
  const { data: taskStatus, isLoading: isPolling } = useTaskStatus(
    taskState?.taskId || null,
    !!taskState?.taskId
  );

  // Update task state when status changes
  useEffect(() => {
    if (!taskStatus || !taskState) return;
    
    // Extract status - it might be in different places depending on API response
    const currentStatus = taskStatus.state || taskStatus.status || 'UNKNOWN';
    
    // Only update if status actually changed
    if (currentStatus === taskState.status) return;
    
    const newState: TaskState = {
      taskId: taskState.taskId,
      status: currentStatus,
      message: taskStatus.result?.message,
      totalDocuments: taskStatus.result?.total_documents || 0,
      uploadedDocuments: taskStatus.result?.documents?.length || 0,
      failedDocuments: taskStatus.result?.failed_documents || [],
      validationErrors: taskStatus.result?.validation_errors || [],
    };
    
    setTaskState(newState);

    // Show completion notification
    if (currentStatus === 'FINISHED') {
      toast.success('Documents ingested successfully!');
      setSelectedFiles([]);
      refetchCollections();
      if (viewingCollection === collectionName) {
        refetchDocuments();
      }
    } else if (currentStatus === 'FAILED') {
      toast.error('Document ingestion failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskStatus, taskState?.status, taskState?.taskId, refetchCollections]);

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    try {
      await createCollectionMutation.mutateAsync({
        collection_name: collectionName,
        embedding_dimension: 2048,
        metadata_schema: [],
      });
      toast.success(`Collection "${collectionName}" created successfully`);
      refetchCollections();
    } catch (error) {
      toast.error(
        `Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!collectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    // Clear previous task state and invalidate old queries
    if (taskState?.taskId) {
      queryClient.removeQueries(['rag-task-status', taskState.taskId]);
    }
    setTaskState(null);

    try {
      const result = await uploadDocumentsMutation.mutateAsync({
        files: selectedFiles,
        collection_name: collectionName,
        blocking: false,
        split_options: {
          chunk_size: chunkSize,
          chunk_overlap: chunkOverlap,
        },
        generate_summary: generateSummary,
      });

      if (result.task_id) {
        // Small delay to ensure state is cleared
        setTimeout(() => {
          setTaskState({
            taskId: result.task_id,
            status: 'PENDING',
            totalDocuments: selectedFiles.length,
            uploadedDocuments: 0,
            failedDocuments: [],
            validationErrors: [],
          });
        }, 100);
        toast.info('Upload started. Monitoring progress...');
      } else {
        toast.success('Documents uploaded successfully');
        setSelectedFiles([]);
        refetchCollections();
      }
    } catch (error) {
      toast.error(
        `Failed to upload documents: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FINISHED':
      case 'SUCCESS':
        return <PiCheckCircleFill size={24} className="text-green-500" />;
      case 'FAILED':
      case 'FAILURE':
        return <PiXCircleFill size={24} className="text-red-500" />;
      case 'PENDING':
        return <PiClockFill size={24} className="text-yellow-500" />;
      case 'PROCESSING':
      case 'RUNNING':
        return <CircularProgress size={24} />;
      default:
        // For any completed state, show success icon
        return <PiCheckCircleFill size={24} className="text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINISHED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'info';
    }
  };

  const progress = taskState
    ? taskState.totalDocuments > 0
      ? (taskState.uploadedDocuments / taskState.totalDocuments) * 100
      : 0
    : 0;

  return (
    <div className={clsx(styles['container'], 'max-w-6xl mx-auto p-6')}>
      {/* Header with Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">RAG Document Ingestion</h1>
          <p className="text-gray-600">
            Upload documents to your RAG knowledge base
          </p>
        </div>
        <Link
          to={STUDENT_WEB_ROUTES.RAG_ASK}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PiChatCircleFill size={20} />
          <span>Go to Chat</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Collection Management */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Collection Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Collection Name *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., multimodal_data"
                    />
                    <button
                      onClick={handleCreateCollection}
                      disabled={createCollectionMutation.isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {createCollectionMutation.isLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        'Create New'
                      )}
                    </button>
                  </div>
                  {collectionsData && collectionsData.collections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">Existing ({collectionsData.total_collections}):</span>
                      {collectionsData.collections.map((col) => (
                        <Chip
                          key={col.collection_name}
                          label={`${col.collection_name} (${col.num_entities})`}
                          size="small"
                          onClick={() => setCollectionName(col.collection_name)}
                          className="cursor-pointer"
                          color={collectionName === col.collection_name ? 'primary' : 'default'}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Chunking Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chunk Size
                    </label>
                    <input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={128}
                      max={2048}
                    />
                    <p className="text-xs text-gray-500 mt-1">128-2048 tokens</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chunk Overlap
                    </label>
                    <input
                      type="number"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={0}
                      max={512}
                    />
                    <p className="text-xs text-gray-500 mt-1">0-512 tokens</p>
                  </div>
                </div>

                {/* Generate Summary Option */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={generateSummary}
                    onChange={(e) => setGenerateSummary(e.target.checked)}
                    id="generate-summary"
                    className="w-4 h-4"
                  />
                  <label htmlFor="generate-summary" className="text-sm">
                    Generate document summaries (slower but more accurate)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
              <div className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-3"
                  >
                    <PiUploadSimpleFill size={48} className="text-gray-400" />
                    <div className="text-center">
                      <span className="text-gray-700 font-medium">
                        Click to select files or drag and drop
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        PDF, DOCX, TXT, MD files supported
                      </p>
                    </div>
                  </button>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Selected Files ({selectedFiles.length}):
                      </p>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <PiFilePdfFill size={24} className="text-red-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <PiTrashFill size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={
                    selectedFiles.length === 0 ||
                    uploadDocumentsMutation.isLoading ||
                    (taskState && taskState.status === 'PENDING')
                  }
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors',
                    {
                      'bg-blue-600 text-white hover:bg-blue-700':
                        selectedFiles.length > 0 &&
                        !uploadDocumentsMutation.isLoading &&
                        (!taskState || taskState.status !== 'PENDING'),
                      'bg-gray-300 text-gray-500 cursor-not-allowed':
                        selectedFiles.length === 0 ||
                        uploadDocumentsMutation.isLoading ||
                        (taskState && taskState.status === 'PENDING'),
                    }
                  )}
                >
                  {uploadDocumentsMutation.isLoading || isPolling ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <PiUploadSimpleFill size={20} />
                      <span>Upload and Ingest Documents</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Status Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ingestion Status</h2>
              
              {!taskState ? (
                <div className="text-center py-8 text-gray-500">
                  <PiUploadSimpleFill size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No active ingestion</p>
                  <p className="text-xs mt-1">Upload files to start</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Header */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    {getStatusIcon(taskState.status)}
                    <div className="flex-1">
                      <p className="font-semibold">{taskState.status}</p>
                      <p className="text-xs text-gray-600">Task ID: {taskState.taskId.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">
                        {taskState.uploadedDocuments} / {taskState.totalDocuments}
                      </span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      className="h-2 rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {progress.toFixed(0)}% complete
                    </p>
                  </div>

                  {/* Message */}
                  {taskState.message && (
                    <Alert severity={getStatusColor(taskState.status) as any}>
                      {taskState.message}
                    </Alert>
                  )}

                  {/* Failed Documents */}
                  {taskState.failedDocuments.length > 0 && (
                    <Alert severity="error">
                      <p className="font-semibold mb-2">
                        {taskState.failedDocuments.length} document(s) failed
                      </p>
                      <div className="space-y-1 text-xs">
                        {taskState.failedDocuments.map((doc: any, i: number) => (
                          <div key={i}>
                            <p className="font-medium">{doc.document_name}</p>
                            <p className="text-red-700">{doc.error_message}</p>
                          </div>
                        ))}
                      </div>
                    </Alert>
                  )}

                  {/* Validation Errors */}
                  {taskState.validationErrors.length > 0 && (
                    <Alert severity="warning">
                      <p className="font-semibold">
                        {taskState.validationErrors.length} validation error(s)
                      </p>
                    </Alert>
                  )}

                  {/* Clear Status Button */}
                  {taskState.status === 'FINISHED' || taskState.status === 'FAILED' && (
                    <button
                      onClick={() => setTaskState(null)}
                      className="w-full px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Clear Status
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collection Documents Viewer */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <PiFolderOpenFill size={24} className="text-blue-600" />
                <h2 className="text-xl font-semibold">Collection Documents</h2>
              </div>
              <button
                onClick={() => setShowDocuments(!showDocuments)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showDocuments ? <PiCaretDownFill /> : <PiCaretRightFill />}
                <span>{showDocuments ? 'Hide' : 'Show'} Documents</span>
              </button>
            </div>

            <Collapse in={showDocuments}>
              <div className="space-y-4">
                {/* Collection Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Collection to View
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {collectionsData?.collections.map((col) => (
                      <Chip
                        key={col.collection_name}
                        label={`${col.collection_name} (${col.num_entities})`}
                        onClick={() => {
                          setViewingCollection(col.collection_name);
                          refetchDocuments();
                        }}
                        color={viewingCollection === col.collection_name ? 'primary' : 'default'}
                        className="cursor-pointer"
                      />
                    ))}
                  </div>
                </div>

                {/* Documents List */}
                {viewingCollection && (
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700">
                          Documents in "{viewingCollection}"
                        </h3>
                        {documentsData && (
                          <span className="text-sm text-gray-500">
                            {documentsData.documents?.length || 0} files
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      {isLoadingDocuments ? (
                        <div className="flex items-center justify-center py-8">
                          <CircularProgress size={32} />
                          <span className="ml-3 text-gray-500">Loading documents...</span>
                        </div>
                      ) : documentsData?.documents && documentsData.documents.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {documentsData.documents.map((doc: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <PiFileTextFill size={24} className="text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {doc.filename || doc.document_name || 'Unknown'}
                                  </p>
                                  {doc.uploaded_at && (
                                    <p className="text-xs text-gray-500">
                                      Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                                    </p>
                                  )}
                                  {doc.metadata && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(doc.metadata).map(([key, value]) => (
                                        <Chip
                                          key={key}
                                          label={`${key}: ${value}`}
                                          size="small"
                                          variant="outlined"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (window.confirm(`Delete "${doc.filename || doc.document_name}"?`)) {
                                    toast.info('Delete functionality coming soon');
                                  }
                                }}
                                title="Delete document"
                              >
                                <PiTrashFill size={18} />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <PiFileTextFill size={48} className="mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No documents found in this collection</p>
                          <p className="text-xs mt-1">Upload files to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!viewingCollection && (
                  <div className="text-center py-8 text-gray-500">
                    <PiFolderOpenFill size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Select a collection to view its documents</p>
                  </div>
                )}
              </div>
            </Collapse>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
