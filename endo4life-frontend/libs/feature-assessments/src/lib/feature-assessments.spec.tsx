import { render } from '@testing-library/react';

import FeatureAssessments from './feature-assessments';
import React from 'react';

describe('FeatureAssessments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureAssessments />);
    expect(baseElement).toBeTruthy();
  });
});
