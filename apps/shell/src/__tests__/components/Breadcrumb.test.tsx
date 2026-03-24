import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, ToolBreadcrumb } from '@/components/Breadcrumb';
import { MemoryRouter } from 'react-router-dom';

describe('Breadcrumb', () => {
  it('should render breadcrumb items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'JSON Formatter' },
    ];
    
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  it('should render last item as active (no link)', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Tools', href: '/tools' },
      { label: 'JSON Formatter' },
    ];
    
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    
    const lastItem = screen.getByText('JSON Formatter');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('should render links for non-last items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Tools', href: '/tools' },
    ];
    
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
  });

  it('should render icons when provided', () => {
    const items = [
      { label: 'Home', href: '/', icon: <span data-testid="home-icon" /> },
      { label: 'JSON Formatter' },
    ];
    
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
});

describe('ToolBreadcrumb', () => {
  it('should render tool-specific breadcrumb', () => {
    render(
      <MemoryRouter>
        <ToolBreadcrumb toolName="JSON Formatter" />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });
});
