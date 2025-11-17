import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  useDoctorUserConversations,
  useDoctorUserConversationFilters,
  DoctorUserConversationSection,
} from '@endo4life/feature-discussion';
import {
  ResourceDetailContext,
  ResourceCreateContext,
} from '@endo4life/feature-resources';
import { TbMessage2Question } from 'react-icons/tb';

export default function MyQuestionsPage() {
  const { t } = useTranslation('common');
  const { userProfile } = useAuthContext();

  const { filter, updateFilter } = useDoctorUserConversationFilters(false);

  // Determine if user is a specialist/doctor or a customer/student
  const userRole = userProfile?.roles?.[0];
  const isSpecialist = userRole === 'SPECIALIST';
  const filterField = isSpecialist ? 'assigneeId' : 'questionerId';

  // Set filter based on current user role
  // SPECIALIST: see questions assigned to them (assigneeId)
  // CUSTOMER/STUDENT: see questions they created (questionerId)
  useEffect(() => {
    if (userProfile?.id) {
      updateFilter({
        ...filter,
        query: {
          [filterField]: userProfile.id,
        },
      });
    }
  }, [userProfile?.id, filterField]);

  const { data, loading, refetch } = useDoctorUserConversations(
    filter,
    filterField,
    userProfile?.id,
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Provide context for DoctorUserConversationFormInput
  const resourceDetailContextValue = {
    resource: { type: 'IMAGE' } as any, // Backend only accepts VIDEO or IMAGE
    entityField: filterField, // Dynamically set based on user role
    entityIdValue: userProfile?.id || '',
  };

  const resourceCreateContextValue = {
    loading: false,
  };

  return (
    <ResourceDetailContext.Provider value={resourceDetailContextValue}>
      <ResourceCreateContext.Provider value={resourceCreateContextValue}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <TbMessage2Question size={32} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {userRole === 'SPECIALIST'
                  ? 'Assigned Questions'
                  : t('navigation.txtMenuItemQ&A')}
              </h1>
            </div>
            <p className="text-base text-gray-600 ml-11">
              {userRole === 'SPECIALIST'
                ? 'View questions assigned to you. Go to the course resource to reply.'
                : 'Track your questions and get answers from assigned doctors'}
            </p>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <DoctorUserConversationSection
              discussAcceptable={false}
              replyAcceptable={!isSpecialist}
              data={data}
              loading={loading}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </ResourceCreateContext.Provider>
    </ResourceDetailContext.Provider>
  );
}
