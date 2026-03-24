import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolWrapper, ToolErrorBoundary, ToolSuspense } from '../ToolWrapper';
import React, { Suspense } from 'react';

describe('ToolWrapper', () => {
  it('should render children when not loading', () => {
    render(
      <ToolWrapper metadata={{ id: 'test', name: 'Test', version: '1.0.0', category: 'other', tags: [] }}>
        <div>Tool Content</div>
      </ToolWrapper>
    );
    
    expect(screen.getByText('Tool Content')).toBeInTheDocument();
  });

  it('should render skeleton when loading', () => {
    render(
      <ToolWrapper 
        metadata={{ id: 'test', name: 'Test', version: '1.0.0', category: 'other', tags: [] }}
        isLoading={true}
      >
        <div>Tool Content</div>
      </ToolWrapper>
    );
    
    expect(screen.queryByText('Tool Content')).not.toBeInTheDocument();
  });
});

describe('ToolErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  it('should render fallback when error occurs', () => {
    const Fallback = () => <div>Error occurred</div>;
    
    render(
      <ToolErrorBoundary fallback={<Fallback />}>
        <ThrowError />
      </ToolErrorBoundary>
    );
    
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('should render default error UI when no fallback provided', () => {
    render(
      <ToolErrorBoundary>
        <ThrowError />
      </ToolErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

describe('ToolSuspense', () => {
  const LazyComponent = React.lazy(() => 
    Promise.resolve({ default: () => <div>Loaded</div> })
  );

  it('should render fallback while loading', () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
