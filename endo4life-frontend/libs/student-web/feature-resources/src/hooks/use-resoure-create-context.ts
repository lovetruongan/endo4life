import { createContext, useContext } from "react";
import { ResourceCreateContextParams } from "../types";

export const ResourceCreateContext = createContext<ResourceCreateContextParams | undefined>(undefined);

export const useResourceCreateContext = (): ResourceCreateContextParams => {
  const context = useContext(ResourceCreateContext);
  if (context === undefined) {
    throw new Error("useResourceCreate must be used within a ResourceCreateContextProvider");
  }
  return context;
}