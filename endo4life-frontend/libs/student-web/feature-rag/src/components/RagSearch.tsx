import { useState } from 'react';
import { useRagSearch, useCollections } from '../hooks';
import { SearchRequest } from '../api';
import { CircularProgress, Card, CardContent, Chip, Collapse } from '@mui/material';
import { 
  PiMagnifyingGlassBold, 
  PiChatCircleFill, 
  PiUploadSimpleFill,
  PiCaretDownBold,
  PiCaretUpBold
} from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import clsx from 'clsx';
import styles from './RagSearch.module.css';

interface RagSearchProps {
  collectionName?: string;
  defaultTopK?: number;
}

export function RagSearch({
  collectionName: defaultCollectionName = 'multimodal_data',
  defaultTopK = 10,
}: RagSearchProps) {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(defaultTopK);
  const [enableReranker, setEnableReranker] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] = useState(defaultCollectionName);
  const searchMutation = useRagSearch();
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections();

  const handleSearch = async () => {
    if (!query.trim() || !selectedCollection) return;

    const request: SearchRequest = {
      query: query.trim(),
      reranker_top_k: 2,
      vdb_top_k: topK,
      vdb_endpoint: 'http://milvus:19530',
      collection_names: [selectedCollection],
      enable_query_rewriting: false,
      enable_reranker: enableReranker,
    };

    searchMutation.mutate(request);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={clsx(styles['container'], 'max-w-6xl mx-auto p-6')}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">RAG Document Search</h1>
          <p className="text-gray-600">
            Search for relevant documents without generating a response
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={STUDENT_WEB_ROUTES.RAG_INGEST}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PiUploadSimpleFill size={20} />
            <span>Upload</span>
          </Link>
          <Link
            to={STUDENT_WEB_ROUTES.RAG_ASK}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PiChatCircleFill size={20} />
            <span>Chat</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Settings Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Search Settings</h2>
              <div className="space-y-4">
                {/* Collection Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Collection
                  </label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={collectionsLoading}
                  >
                    {collectionsLoading ? (
                      <option>Loading...</option>
                    ) : collectionsData?.collections?.length ? (
                      collectionsData.collections.map((col) => (
                        <option key={col.collection_name} value={col.collection_name}>
                          {col.collection_name} ({col.num_entities} docs)
                        </option>
                      ))
                    ) : (
                      <option value="multimodal_data">multimodal_data (default)</option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {collectionsData?.total_collections || 0} collections available
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Top K Results
                  </label>
                  <input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">1-50 documents</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableReranker}
                      onChange={(e) => setEnableReranker(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable Reranker</span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Improves result relevance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Search Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Input */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập nội dung tìm kiếm..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  disabled={searchMutation.isLoading}
                />
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || searchMutation.isLoading}
                  className={clsx(
                    'px-8 py-3 rounded-lg flex items-center gap-2 font-medium transition-all',
                    {
                      'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg':
                        query.trim() && !searchMutation.isLoading,
                      'bg-gray-300 text-gray-500 cursor-not-allowed':
                        !query.trim() || searchMutation.isLoading,
                    }
                  )}
                >
                  {searchMutation.isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <>
                      <PiMagnifyingGlassBold size={20} />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searchMutation.data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Search Results
                </h3>
                <Chip
                  label={`${searchMutation.data.total_results} document${searchMutation.data.total_results !== 1 ? 's' : ''} found`}
                  color="primary"
                />
              </div>

              {searchMutation.data.results.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <PiMagnifyingGlassBold size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">No documents found matching your query</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try adjusting your search terms or increasing Top K
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {searchMutation.data.results.map((doc, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-lg truncate">
                                  {doc.document_name || `Document ${index + 1}`}
                                </h4>
                                {doc.document_type && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Type: {doc.document_type}
                                  </p>
                                )}
                                {doc.metadata?.content_metadata?.page_number !== undefined && (
                                  <p className="text-xs text-gray-500">
                                    Page: {doc.metadata.content_metadata.page_number + 1}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {doc.score && (
                                <Chip
                                  label={`${(doc.score * 100).toFixed(1)}%`}
                                  size="small"
                                  className={getScoreColor(doc.score)}
                                />
                              )}
                              <button
                                onClick={() => setExpandedDoc(expandedDoc === index ? null : index)}
                                className="p-2 hover:bg-gray-100 rounded transition-colors"
                              >
                                {expandedDoc === index ? (
                                  <PiCaretUpBold size={20} />
                                ) : (
                                  <PiCaretDownBold size={20} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                            {expandedDoc === index ? (
                              <p className="whitespace-pre-wrap">{doc.content}</p>
                            ) : (
                              <p className="line-clamp-3">{doc.content}</p>
                            )}
                          </div>

                          {/* Metadata - Only show important fields */}
                          {expandedDoc === index && doc.metadata && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">
                                Document Details:
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {doc.metadata.content_metadata?.filename && (
                                  <div>
                                    <span className="font-medium">Filename:</span>{' '}
                                    <span className="text-gray-700">{doc.metadata.content_metadata.filename}</span>
                                  </div>
                                )}
                                {doc.metadata.content_metadata?.text_metadata?.language && (
                                  <div>
                                    <span className="font-medium">Language:</span>{' '}
                                    <span className="text-gray-700">{doc.metadata.content_metadata.text_metadata.language}</span>
                                  </div>
                                )}
                                {doc.metadata.content_metadata?.hierarchy?.page_count && (
                                  <div>
                                    <span className="font-medium">Total Pages:</span>{' '}
                                    <span className="text-gray-700">{doc.metadata.content_metadata.hierarchy.page_count}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {searchMutation.isError && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 text-red-700">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    ⚠️
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Search failed</p>
                    <p className="text-sm">
                      {searchMutation.error instanceof Error
                        ? searchMutation.error.message
                        : 'Unknown error'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!searchMutation.data && !searchMutation.isError && !searchMutation.isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <PiMagnifyingGlassBold size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Ready to Search</h3>
                <p className="text-gray-600 mb-4">
                  Enter a query above to find relevant documents
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Chip
                    label="Example: medical terminology"
                    onClick={() => setQuery('medical terminology')}
                    className="cursor-pointer"
                  />
                  <Chip
                    label="Example: treatment options"
                    onClick={() => setQuery('treatment options')}
                    className="cursor-pointer"
                  />
                  <Chip
                    label="Example: research findings"
                    onClick={() => setQuery('research findings')}
                    className="cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
