import { render } from '@testing-library/react';

import UserFilters from './user-filters';

describe('UserFilters', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserFilters />);
    expect(baseElement).toBeTruthy();
  });
});
