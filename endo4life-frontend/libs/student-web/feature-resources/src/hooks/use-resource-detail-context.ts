import { createContext, useContext } from "react";
import { ResourceDetailContextParams } from "../types/resource-detail-context";

export const ResourceDetailContext = createContext<ResourceDetailContextParams | undefined>(undefined);

export const useResourceDetailContext = (): ResourceDetailContextParams => {
  const context = useContext(ResourceDetailContext);
  if (context === undefined) {
    throw new Error("useResourceDetail must be used within a ResourceDetailContextProvider");
  }
  return context;
}