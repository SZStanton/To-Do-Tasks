// Adds the DOM matchers, toBeInTheDocument and friends
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount between tests, or the previous render is still in the document and
// getByRole finds two of everything
afterEach(cleanup);
