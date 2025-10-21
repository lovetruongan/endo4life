import { Box, createTheme, Tab, Tabs, ThemeProvider } from '@mui/material';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import {
  useCommentFilters,
  useComments,
  useDoctorUserConversationFilters,
  useDoctorUserConversations,
} from '@endo4life/feature-discussion';
import styles from './DiscussionWrapper.module.css';
import DiscussionSection from './DiscussionSection';
import DoctorUserConversationSection from './DoctorUserConversationSection';
import { useResourceDetailContext } from '@endo4life/feature-resources';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c224c',
    },
  },
});

interface IDiscussionWrapperProps {
  discussAcceptable?: boolean;
}

export function DiscussionWrapper({
  discussAcceptable = true,
}: IDiscussionWrapperProps) {
  const { entityField, entityIdValue } = useResourceDetailContext();
  const [selectedTab, setSelectedTag] = useState<string>('comment');

  // Comments hooks
  const { filter: commentFilter } = useCommentFilters(false);
  const {
    data: comments,
    refetch: refetchComments,
    loading: loadingComments,
  } = useComments(commentFilter, entityField, entityIdValue);

  // Doctor-User Conversations hooks
  const { filter: conversationFilter } =
    useDoctorUserConversationFilters(false);
  const {
    data: conversations,
    refetch: refetchConversations,
    loading: loadingConversations,
  } = useDoctorUserConversations(
    conversationFilter,
    entityField,
    entityIdValue,
  );

  const handleChangeTab = useCallback((tab: string) => {
    setSelectedTag(tab);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box
        className={clsx(styles['container'], {
          'block w-full border rounded-xl border-slate-300': true,
        })}
      >
        <Tabs
          value={selectedTab}
          onChange={(_event: React.SyntheticEvent, value: any) =>
            handleChangeTab(value)
          }
          textColor="primary"
          indicatorColor="primary"
          aria-label="primary tabs example"
        >
          <Tab value="comment" label="Bình luận" />
          <Tab value="askExpert" label="Hỏi chuyên gia" />
        </Tabs>
        <div className="p-4">
          {selectedTab === 'comment' && (
            <DiscussionSection
              discussAcceptable={discussAcceptable}
              loading={loadingComments}
              data={comments}
              onRefresh={refetchComments}
            />
          )}
          {selectedTab === 'askExpert' && (
            <DoctorUserConversationSection
              discussAcceptable={discussAcceptable}
              loading={loadingConversations}
              data={conversations}
              onRefresh={refetchConversations}
            />
          )}
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default DiscussionWrapper;
