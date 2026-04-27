import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SanitizedHTMLProps {
  html: string;
  className?: string;
  tag?: React.ElementType;
}

/**
 * SanitizedHTML Component
 * Safely renders HTML content provided by users or external sources.
 * Prevents XSS attacks by cleaning the HTML before rendering.
 */
const SanitizedHTML: React.FC<SanitizedHTMLProps> = ({ 
  html, 
  className = '', 
  tag: Tag = 'div' 
}) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
        'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'span', 'div', 'img'
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'class']
    });
  }, [html]);

  return (
    <Tag 
      className={`sanitized-html ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};

export default SanitizedHTML;
