import {
  CoursesList,
  ResourceFilter,
  ResourceFilters,
  ResourcePagination,
  ResourceSearch,
  ResourcesList,
  ResourcesRecent,
  ResourceTypeEnum,
  ResourceTypeSelect,
  useResourceFilters,
  useResources,
  useResourcesAccessed,
} from '@endo4life/feature-resources';
import { useMemo } from 'react';

enum ResourceType {
  Image = 'IMAGE',
  Video = 'VIDEO',
  Course = 'COURSE',
}

export function ResourcesPage() {
  const { filter: resourceFilter, updateFilter: updateResourceFilter } =
    useResourceFilters();
  const {
    data: resourcesData,
    loading: resourcesLoading,
    pagination: resourcesPagination,
  } = useResources(resourceFilter);

  const handleSearchChange = (resourceType: ResourceType, value: string) => {
    const newResourceFilter = new ResourceFilter(resourceFilter);
    newResourceFilter.setQuery('resourceType', resourceType);
    if (resourceType === ResourceType.Course) {
      newResourceFilter.setQuery('title', value);
      newResourceFilter.setSearch('');
    } else {
      newResourceFilter.setSearch(value);
      newResourceFilter.setQuery('title', '');
    }
    newResourceFilter.setPage(0);
    updateResourceFilter(newResourceFilter.toFilter());
  };

  const currentResourceType = useMemo<string>(() => {
    return (
      new ResourceFilter(resourceFilter).getType() || ResourceTypeEnum.IMAGE
    );
  }, [resourceFilter]);

  const recentData = useResourcesAccessed({
    resourceType: ResourceTypeEnum.IMAGE,
  });

  return (
    <div className="px-4 pb-4 sm:px-10">
      <ResourceSearch onChange={handleSearchChange} defaultValue="" />

      {recentData.data && recentData.data.length > 0 && (
        <>
          <ResourcesRecent filter={resourceFilter} />
          <ResourcesList filter={resourceFilter} loading={resourcesLoading} data={recentData.data} onChange={updateResourceFilter} />
        </>
      )}

      <ResourceTypeSelect filter={resourceFilter} onChange={updateResourceFilter} />
      <ResourceFilters onChange={updateResourceFilter} />

      <div className="mt-6">
        {currentResourceType === ResourceType.Course ? (
          <CoursesList loading={resourcesLoading} data={resourcesData} />
        ) : (
          <ResourcesList
            filter={resourceFilter}
            loading={resourcesLoading}
            data={resourcesData}
            onChange={updateResourceFilter}
          />
        )}

        <ResourcePagination
          pagination={resourcesPagination}
          filter={resourceFilter}
          onChange={updateResourceFilter}
        />
      </div>
    </div>
  );
}

export default ResourcesPage;
