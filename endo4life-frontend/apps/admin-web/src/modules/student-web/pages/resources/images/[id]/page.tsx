import { useParams } from "react-router-dom";
import {
  ResourceDetail,
  ResourceDetailContext,
  ResourceDetailContextParams,
  ResourceDetailSimilar,
  useResourceById,
} from '@endo4life/feature-resources';
import { booleanUtils, objectUtils, stringUtils } from "@endo4life/util-common";
import { useMemo } from "react";

export function ResourceImagePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: image, loading: imageLoading } = useResourceById(id);

  const resourceDetailContextValue: ResourceDetailContextParams = useMemo(() => ({
    resource: objectUtils.defaultObject(image),
    entityField: "resourceId",
    entityIdValue: stringUtils.defaultString(image?.id),
  }), [image]);
  
  return (
    <ResourceDetailContext.Provider value={resourceDetailContextValue}>
      <div className="flex flex-col w-screen gap-5 p-5">
        <div className='flex gap-5'>
          {/* left: */}
          <div
            className="flex flex-col flex-auto w-full gap-5"
          >
            <ResourceDetail
              loading={booleanUtils.defaultBoolean(imageLoading)}
            />
          </div>
          {/* right */}
          <div
            className="flex-none hidden lg:block"
          >
            {!imageLoading && (
              <ResourceDetailSimilar />
            )}
          </div>
        </div>
      </div>
    </ResourceDetailContext.Provider>
  );
}

export default ResourceImagePage;