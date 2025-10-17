import { Box, createTheme, Tab, Tabs, ThemeProvider } from "@mui/material";
import clsx from "clsx";
import { useCallback, useState } from "react";
import { useCommentFilters, useComments } from "@endo4life/feature-discussion";
import styles from './DiscussionWrapper.module.css';
import DiscussionSection from "./DiscussionSection";
import { useResourceDetailContext } from "@endo4life/feature-resources";

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
  const [selectedTab, setSelectedTag] = useState<string>("comment");
  const { filter, updateFilter: _updateFilter } = useCommentFilters(false);
  const { data: comments, refetch, loading } = useComments(filter, entityField, entityIdValue);

  const handleChangeTab = useCallback((tab: string) => {
    setSelectedTag(tab);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box className={clsx(styles["container"], {
        "block w-full border rounded-xl border-slate-300": true
      })}>
        <Tabs
          value={selectedTab}
          onChange={(_event: React.SyntheticEvent, value: any) => handleChangeTab(value)}
          textColor="primary"
          indicatorColor="primary"
          aria-label="primary tabs example"
        >
          <Tab value="comment" label="Bình luận" />
          <Tab value="askExpert" label="Hỏi chuyên gia" />
        </Tabs>
        <div className="p-4">
          {selectedTab === "comment" && (
            <DiscussionSection
              discussAcceptable={discussAcceptable}
              loading={loading}
              data={comments}
              onRefresh={refetch}
            />
          )}
          {selectedTab === "askExpert" && (
            <DiscussionSection
              discussAcceptable={discussAcceptable}
              data={[]}
              // onChangeData={...}
            />
          )}
        </div>
      </Box>
    </ThemeProvider>
  )
}

export default DiscussionWrapper;
