import { render } from '@testing-library/react';

import FeatureLibrary from './feature-library';

describe('FeatureLibrary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureLibrary />);
    expect(baseElement).toBeTruthy();
  });
});
