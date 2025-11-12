import { useAuthContext } from '@endo4life/feature-auth';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

export default function DashboardPage() {
  const { userProfile, isAuthenticated } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Endo4Life - Admin Dashboard</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p className="mb-2 flex items-center gap-2">
          Status:{' '}
          {isAuthenticated ? (
            <span className="flex items-center gap-1 text-green-600">
              <MdCheckCircle size={16} /> Authenticated
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <MdCancel size={16} /> Not Authenticated
            </span>
          )}
        </p>

        {userProfile && (
          <div className="mt-4">
            <h3 className="font-semibold">User Profile:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Users</h3>
          <p className="text-blue-600">Manage system users</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Courses</h3>
          <p className="text-green-600">Manage educational courses</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Resources</h3>
          <p className="text-purple-600">Manage learning resources</p>
        </div>
      </div>
    </div>
  );
}
