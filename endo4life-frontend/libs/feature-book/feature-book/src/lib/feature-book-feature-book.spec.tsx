import { render } from '@testing-library/react';

import FeatureBookFeatureBook from './feature-book-feature-book';

describe('FeatureBookFeatureBook', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureBookFeatureBook />);
    expect(baseElement).toBeTruthy();
  });
});
