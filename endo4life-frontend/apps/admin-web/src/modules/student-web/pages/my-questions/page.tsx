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
import { Container, Typography, Box } from '@mui/material';
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TbMessage2Question size={32} />
              <Typography variant="h4" component="h1">
                {userRole === 'SPECIALIST'
                  ? 'Assigned Questions'
                  : t('navigation.txtMenuItemQ&A')}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {userRole === 'SPECIALIST'
                ? 'View questions assigned to you. Go to the course resource to reply.'
                : 'Track your questions and get answers from assigned doctors'}
            </Typography>
          </Box>

          <DoctorUserConversationSection
            discussAcceptable={false} // Questions must be asked from course resources, not standalone
            replyAcceptable={!isSpecialist} // Specialists must go to course to reply, students can reply here
            data={data}
            loading={loading}
            onRefresh={handleRefresh}
          />
        </Container>
      </ResourceCreateContext.Provider>
    </ResourceDetailContext.Provider>
  );
}

