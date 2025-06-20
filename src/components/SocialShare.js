// SocialShare.js - Social media sharing component
import React, { useState } from 'react';
import './SocialShare.css';

const SocialShare = ({ 
  url, 
  title, 
  description = '', 
  hashtags = [],
  showLabels = true,
  size = 'medium',
  orientation = 'horizontal'
}) => {
  const [copied, setCopied] = useState(false);

  // Encode URL and text for sharing
  const encodedUrl = encodeURIComponent(url || '');
  const encodedTitle = encodeURIComponent(title || '');
  const encodedDescription = encodeURIComponent(description || '');
  const safeHashtags = Array.isArray(hashtags) ? hashtags : [];
  const hashtagString = safeHashtags.length > 0 ? safeHashtags.map(tag => `#${String(tag)}`).join(' ') : '';
  const encodedHashtags = encodeURIComponent(hashtagString);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(',')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };

  const handleShare = (platform) => {
    if (platform === 'copy') {
      handleCopyLink();
      return;
    }

    // Track sharing event (you can integrate with analytics here)
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url
      });
    }

    // Open share window
    const shareUrl = shareLinks[platform];
    if (shareUrl) {
      window.open(
        shareUrl,
        `share-${platform}`,
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const socialButtons = [
    {
      platform: 'twitter',
      icon: '𝕏',
      label: 'Twitter',
      color: '#1da1f2',
      ariaLabel: `Share on Twitter`
    },
    {
      platform: 'facebook',
      icon: '📘',
      label: 'Facebook',
      color: '#1877f2',
      ariaLabel: `Share on Facebook`
    },
    {
      platform: 'linkedin',
      icon: '💼',
      label: 'LinkedIn',
      color: '#0077b5',
      ariaLabel: `Share on LinkedIn`
    },
    {
      platform: 'reddit',
      icon: '🤖',
      label: 'Reddit',
      color: '#ff4500',
      ariaLabel: `Share on Reddit`
    },
    {
      platform: 'whatsapp',
      icon: '💬',
      label: 'WhatsApp',
      color: '#25d366',
      ariaLabel: `Share on WhatsApp`
    },
    {
      platform: 'email',
      icon: '📧',
      label: 'Email',
      color: '#6b7280',
      ariaLabel: `Share via Email`
    }
  ];

  return (
    <div className={`social-share ${orientation} ${size}`} role="group" aria-label="Share this content">
      <div className="share-header">
        <span className="share-title">Share this post:</span>
      </div>
      
      <div className="share-buttons">
        {/* Native Share API (mobile) */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="share-btn native-share"
            aria-label="Share using device's native sharing"
          >
            <span className="share-icon">📤</span>
            {showLabels && <span className="share-label">Share</span>}
          </button>
        )}

        {/* Social Platform Buttons */}
        {socialButtons.map(({ platform, icon, label, color, ariaLabel }) => (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`share-btn ${platform}`}
            style={{ '--share-color': color }}
            aria-label={ariaLabel}
          >
            <span className="share-icon">{icon}</span>
            {showLabels && <span className="share-label">{label}</span>}
          </button>
        ))}

        {/* Copy Link Button */}
        <button
          onClick={() => handleShare('copy')}
          className={`share-btn copy-link ${copied ? 'copied' : ''}`}
          aria-label="Copy link to clipboard"
        >
          <span className="share-icon">{copied ? '✅' : '🔗'}</span>
          {showLabels && (
            <span className="share-label">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          )}
        </button>
      </div>

      {/* Share Count (placeholder for future implementation) */}
      <div className="share-stats" aria-live="polite">
        <small className="share-count-text">
          Help others discover this content by sharing it!
        </small>
      </div>
    </div>
  );
};

// Compact version for inline use
export const CompactSocialShare = ({ url, title, hashtags = [] }) => {
  return (
    <SocialShare
      url={url}
      title={title}
      hashtags={hashtags}
      showLabels={false}
      size="small"
      orientation="horizontal"
    />
  );
};

// Floating share widget
export const FloatingSocialShare = ({ url, title, description, hashtags = [] }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const threshold = 300; // Show after scrolling 300px
      setIsVisible(scrolled > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="floating-share-widget">
      <SocialShare
        url={url}
        title={title}
        description={description}
        hashtags={hashtags}
        showLabels={false}
        size="small"
        orientation="vertical"
      />
    </div>
  );
};

export default SocialShare;
