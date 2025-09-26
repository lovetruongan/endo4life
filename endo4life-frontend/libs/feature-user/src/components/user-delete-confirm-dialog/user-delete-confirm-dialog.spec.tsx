import { render } from '@testing-library/react';

import UserDeleteConfirmDialog from './user-delete-confirm-dialog';

describe('UserDeleteConfirmDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserDeleteConfirmDialog />);
    expect(baseElement).toBeTruthy();
  });
});
