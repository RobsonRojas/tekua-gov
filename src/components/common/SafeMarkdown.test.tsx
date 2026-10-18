import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafeMarkdown from './SafeMarkdown';

describe('SafeMarkdown', () => {
  it('renders markdown formatting normally', () => {
    render(<SafeMarkdown content={'**bold** and *italic* and `code`'} />);
    expect(screen.getByText('bold', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('italic', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByText('code', { selector: 'code' })).toBeInTheDocument();
  });

  it('renders headings and lists', () => {
    render(<SafeMarkdown content={'# Title\n\n- item 1\n- item 2'} />);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('item 1')).toBeInTheDocument();
    expect(screen.getByText('item 2')).toBeInTheDocument();
  });

  it('strips script tags entirely (no execution, no script element)', () => {
    const { container } = render(
      <SafeMarkdown content={'hello <script>window.__xss = true</script> world'} />
    );
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect((window as any).__xss).toBeUndefined();
    expect(container.textContent).toContain('hello');
    expect(container.textContent).toContain('world');
  });

  it('strips iframes and event-handler attributes from raw HTML', () => {
    const { container } = render(
      <SafeMarkdown content={'<iframe src="https://evil.example"></iframe> <img src="x" onerror="alert(1)"> done'} />
    );
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.textContent).toContain('done');
  });

  it('removes raw HTML tags but keeps their text content', () => {
    render(<SafeMarkdown content={'text <b>bold-html</b> tail'} />);
    // ALLOWED_TAGS=[] strips <b> but KEEP_CONTENT=true preserves the text
    expect(containerText()).toContain('bold-html');
    expect(screen.queryByText('bold-html', { selector: 'b' })).not.toBeInTheDocument();

    function containerText() {
      return document.body.textContent || '';
    }
  });

  it('blocks javascript: URLs in markdown links', () => {
    const { container } = render(
      <SafeMarkdown content={'[click](javascript:alert(1)) [safe](https://example.com)'} />
    );
    const links = Array.from(container.querySelectorAll('a'));
    const dangerous = links.find((a) => a.getAttribute('href')?.toLowerCase().startsWith('javascript:'));
    expect(dangerous).toBeUndefined();
    expect(links.some((a) => a.getAttribute('href') === 'https://example.com')).toBe(true);
  });

  it('blocks data: URLs in markdown links', () => {
    const { container } = render(
      <SafeMarkdown content={'[bad](data:text/html,<script>alert(1)</script>) [ok](/relative)'} />
    );
    const links = Array.from(container.querySelectorAll('a'));
    const dangerous = links.find((a) => a.getAttribute('href')?.toLowerCase().startsWith('data:'));
    expect(dangerous).toBeUndefined();
    expect(links.some((a) => a.getAttribute('href') === '/relative')).toBe(true);
  });

  it('survives empty content', () => {
    const { container } = render(<SafeMarkdown content={''} />);
    expect(container).not.toBeNull();
  });

  it('opens links in a new tab with rel="noopener noreferrer" when linkTarget is set', () => {
    const { container } = render(
      <SafeMarkdown content={'[site](https://example.com/page)'} linkTarget="_blank" />
    );
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/page');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add target/rel to links by default', () => {
    const { container } = render(<SafeMarkdown content={'[site](https://example.com)'} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('still blocks dangerous protocols when linkTarget is set', () => {
    const { container } = render(
      <SafeMarkdown content={'[bad](javascript:alert(1)) [ok](https://example.com)'} linkTarget="_blank" />
    );
    const links = Array.from(container.querySelectorAll('a'));
    expect(links.some((a) => a.getAttribute('href')?.toLowerCase().startsWith('javascript:'))).toBe(false);
    const safe = links.find((a) => a.getAttribute('href') === 'https://example.com');
    expect(safe).toHaveAttribute('target', '_blank');
    expect(safe).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders bare markdown without a wrapper when no styling props are given', () => {
    const { container } = render(<SafeMarkdown content={'plain text'} />);
    expect(container.firstElementChild?.tagName).toBe('P');
  });

  it('wraps the content in a container when contained is set', () => {
    const { container } = render(
      <SafeMarkdown content={'a very long word: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'} contained />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper?.querySelector('p')).not.toBeNull();
  });
});