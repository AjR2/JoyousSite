// MarkdownEditor.js - Rich text editor with markdown support
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import './MarkdownEditor.css';

const MarkdownEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Write your content here...', 
  height = '400px',
  showPreview = true 
}) => {
  const [activeTab, setActiveTab] = useState('write');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      before + textToInsert + after + 
      value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
    
    // Handle Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**', 'bold text');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*', 'italic text');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)', 'link text');
          break;
        default:
          break;
      }
    }
  };

  const toolbarButtons = [
    {
      icon: '𝐁',
      title: 'Bold (Ctrl+B)',
      action: () => insertText('**', '**', 'bold text')
    },
    {
      icon: '𝐼',
      title: 'Italic (Ctrl+I)',
      action: () => insertText('*', '*', 'italic text')
    },
    {
      icon: '≡',
      title: 'Heading',
      action: () => insertText('## ', '', 'Heading')
    },
    {
      icon: '🔗',
      title: 'Link (Ctrl+K)',
      action: () => insertText('[', '](url)', 'link text')
    },
    {
      icon: '📷',
      title: 'Image',
      action: () => insertText('![', '](image-url)', 'alt text')
    },
    {
      icon: '`',
      title: 'Code',
      action: () => insertText('`', '`', 'code')
    },
    {
      icon: '```',
      title: 'Code Block',
      action: () => insertText('```\n', '\n```', 'code block')
    },
    {
      icon: '•',
      title: 'Bullet List',
      action: () => insertText('- ', '', 'list item')
    },
    {
      icon: '1.',
      title: 'Numbered List',
      action: () => insertText('1. ', '', 'list item')
    },
    {
      icon: '>',
      title: 'Quote',
      action: () => insertText('> ', '', 'quote')
    }
  ];

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div 
      ref={editorRef}
      className={`markdown-editor ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <div className="editor-header">
        <div className="editor-tabs">
          <button
            className={`tab ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            ✏️ Write
          </button>
          {showPreview && (
            <button
              className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              👁️ Preview
            </button>
          )}
        </div>
        
        <div className="editor-actions">
          <button
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </div>

      {activeTab === 'write' && (
        <>
          <div className="editor-toolbar">
            {toolbarButtons.map((button, index) => (
              <button
                key={index}
                className="toolbar-btn"
                onClick={button.action}
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>
          
          <div className="editor-content">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="markdown-textarea"
              spellCheck="true"
            />
          </div>
        </>
      )}

      {activeTab === 'preview' && showPreview && (
        <div className="preview-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              // Custom components for better styling
              h1: ({children}) => <h1 className="preview-h1">{children}</h1>,
              h2: ({children}) => <h2 className="preview-h2">{children}</h2>,
              h3: ({children}) => <h3 className="preview-h3">{children}</h3>,
              p: ({children}) => <p className="preview-p">{children}</p>,
              blockquote: ({children}) => <blockquote className="preview-quote">{children}</blockquote>,
              code: ({inline, children}) => 
                inline ? 
                  <code className="preview-code-inline">{children}</code> : 
                  <code className="preview-code-block">{children}</code>,
              pre: ({children}) => <pre className="preview-pre">{children}</pre>,
              ul: ({children}) => <ul className="preview-ul">{children}</ul>,
              ol: ({children}) => <ol className="preview-ol">{children}</ol>,
              li: ({children}) => <li className="preview-li">{children}</li>,
              a: ({href, children}) => (
                <a href={href} className="preview-link" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              img: ({src, alt}) => (
                <img src={src} alt={alt} className="preview-img" loading="lazy" />
              )
            }}
          >
            {value || '*Nothing to preview yet. Start writing in the Write tab.*'}
          </ReactMarkdown>
        </div>
      )}

      <div className="editor-footer">
        <div className="editor-help">
          <details>
            <summary>Markdown Help</summary>
            <div className="help-content">
              <div className="help-section">
                <h4>Text Formatting</h4>
                <ul>
                  <li><code>**bold**</code> → <strong>bold</strong></li>
                  <li><code>*italic*</code> → <em>italic</em></li>
                  <li><code>`code`</code> → <code>code</code></li>
                  <li><code>~~strikethrough~~</code> → <del>strikethrough</del></li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Headers</h4>
                <ul>
                  <li><code># H1</code></li>
                  <li><code>## H2</code></li>
                  <li><code>### H3</code></li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Links & Images</h4>
                <ul>
                  <li><code>[link text](url)</code></li>
                  <li><code>![alt text](image-url)</code></li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Lists</h4>
                <ul>
                  <li><code>- Bullet list</code></li>
                  <li><code>1. Numbered list</code></li>
                </ul>
              </div>
            </div>
          </details>
        </div>
        
        <div className="editor-stats">
          <span>{value.length} characters</span>
          <span>{value.split(/\s+/).filter(word => word.length > 0).length} words</span>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
