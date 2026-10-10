import React, { useEffect, useState } from 'react';

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  /** shown when there is no image or it failed to load; text stays readable (FR-READ-06) */
  fallbackLabel?: string;
}

/** <img> with a graceful fallback for missing / failing visuals (PRD section 8, Network). */
export const SafeImage: React.FC<Props> = ({ src, alt, className = '', fallbackLabel = 'Visual tidak tersedia', ...rest }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel}
        data-testid="image-fallback"
        className={`flex items-center justify-center bg-[#F3EFE7] text-[#667483] text-xs font-medium ${className}`}
      >
        <span className="material-symbols-outlined text-[22px] mr-2" aria-hidden>image_not_supported</span>
        {fallbackLabel}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" {...rest} />;
};
