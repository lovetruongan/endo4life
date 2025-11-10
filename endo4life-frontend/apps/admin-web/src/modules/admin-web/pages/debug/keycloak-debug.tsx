import { EnvConfig } from '@endo4life/feature-config';
import { MdWarning, MdSearch } from 'react-icons/md';

export default function KeycloakDebugPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MdSearch size={28} />
        Keycloak Debug Info
      </h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">
          Environment Configuration
        </h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <strong>URL:</strong> {EnvConfig.Endo4LifeUrl || 'undefined'}
          </div>
          <div>
            <strong>Realm:</strong> {EnvConfig.Endo4LifeRealm || 'undefined'}
          </div>
          <div>
            <strong>Client ID:</strong>{' '}
            {EnvConfig.Endo4LifeClient || 'undefined'}
          </div>
          <div>
            <strong>Service URL:</strong>{' '}
            {EnvConfig.Endo4LifeServiceUrl || 'undefined'}
          </div>
        </div>

        <h3 className="text-md font-semibold mt-4 mb-2">
          Raw Environment Variables
        </h3>
        <div className="space-y-2 font-mono text-sm bg-gray-100 p-2 rounded">
          <div>
            VITE_ENDO4LIFE_APP_URL:{' '}
            {import.meta.env.VITE_ENDO4LIFE_APP_URL || 'undefined'}
          </div>
          <div>
            VITE_ENDO4LIFE_APP_REALM:{' '}
            {import.meta.env.VITE_ENDO4LIFE_APP_REALM || 'undefined'}
          </div>
          <div>
            VITE_ENDO4LIFE_APP_CLIENT:{' '}
            {import.meta.env.VITE_ENDO4LIFE_APP_CLIENT || 'undefined'}
          </div>
        </div>

        <h3 className="text-md font-semibold mt-4 mb-2">
          Expected Keycloak URLs
        </h3>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <strong>Auth URL:</strong> {EnvConfig.Endo4LifeUrl}/realms/
            {EnvConfig.Endo4LifeRealm}/protocol/openid-connect/auth
          </div>
          <div>
            <strong>Token URL:</strong> {EnvConfig.Endo4LifeUrl}/realms/
            {EnvConfig.Endo4LifeRealm}/protocol/openid-connect/token
          </div>
          <div>
            <strong>User Info:</strong> {EnvConfig.Endo4LifeUrl}/realms/
            {EnvConfig.Endo4LifeRealm}/protocol/openid-connect/userinfo
          </div>
        </div>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-yellow-800 mb-2 flex items-center gap-1">
          <MdWarning size={20} />
          Troubleshooting Steps
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>
            Verify the Keycloak realm{' '}
            <code className="bg-yellow-100 px-1 rounded">endo4life</code> exists
          </li>
          <li>
            Verify the client{' '}
            <code className="bg-yellow-100 px-1 rounded">endo4life_app</code>{' '}
            exists in the realm
          </li>
          <li>
            Check that the client is enabled and configured as a public client
          </li>
          <li>
            Ensure Valid redirect URIs include:{' '}
            <code className="bg-yellow-100 px-1 rounded">
              http://localhost:3000/*
            </code>
          </li>
          <li>
            Ensure Web origins include:{' '}
            <code className="bg-yellow-100 px-1 rounded">
              http://localhost:3000
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
}
