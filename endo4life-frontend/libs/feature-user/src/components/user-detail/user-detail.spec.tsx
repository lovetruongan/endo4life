import { render } from '@testing-library/react';

import UserDetail from './user-detail';

describe('UserDetail', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserDetail />);
    expect(baseElement).toBeTruthy();
  });
});
