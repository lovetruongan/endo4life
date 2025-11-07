import { RagChat } from '@endo4life/feature-rag';

export function RagAskPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
        <RagChat />
      </div>
    </div>
  );
}

export default RagAskPage;

