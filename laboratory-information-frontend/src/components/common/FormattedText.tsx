import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * FormattedText component that formats text from API responses.
 * Supports:
 * - Markdown-style bold: **text** -> <strong>text</strong>
 * - Newlines: \n -> <br />
 * - Multiple spaces: preserved with whitespace-pre-wrap
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text by markdown bold markers (**text**)
  const parts: (string | { type: 'bold'; content: string })[] = [];
  let currentIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let hasBold = false;

  // Reset regex for multiple uses
  boldRegex.lastIndex = 0;
  
  while ((match = boldRegex.exec(text)) !== null) {
    hasBold = true;
    // Add text before the bold marker
    if (match.index > currentIndex) {
      const beforeText = text.substring(currentIndex, match.index);
      if (beforeText) {
        parts.push(beforeText);
      }
    }

    // Add bold text
    parts.push({ type: 'bold', content: match[1] });

    // Update current index
    currentIndex = match.index + match[0].length;
  }

  // Add remaining text after last match only if we found bold markers
  if (hasBold && currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  // If no bold markers found, just use the original text
  if (!hasBold) {
    parts.push(text);
  }

  // Render the formatted text with line breaks
  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          // Split by newlines and render with <br />
          const lines = part.split('\n');
          return (
            <React.Fragment key={index}>
              {lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        } else {
          // Render bold text, also handling newlines within bold text
          const lines = part.content.split('\n');
          return (
            <strong key={index}>
              {lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </strong>
          );
        }
      })}
    </div>
  );
};

/**
 * Alternative version using dangerouslySetInnerHTML for simpler rendering
 * Use this if you prefer HTML rendering over React components
 */
export const FormattedTextHTML: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Convert markdown-style bold to HTML
  const formattedText = text
    // Convert **text** to <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert \n to <br />
    .replace(/\n/g, '<br />');

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
};

export default FormattedText;

