import { createContext, useContext } from 'react';

interface FilterByUserContextType {
  filterByUser: (userName: string) => void;
}

const FilterByUserContext = createContext<FilterByUserContextType | null>(null);

export const FilterByUserProvider = FilterByUserContext.Provider;

export const useFilterByUser = () => useContext(FilterByUserContext);
