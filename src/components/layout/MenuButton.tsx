import { useState } from 'react';

export default function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
      className="flex items-center justify-center cursor-pointer shrink-0 mt-2"
    >
      {isOpen ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line x1="2" y1="2" x2="20" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
          <line x1="20" y1="2" x2="2" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      ) : (
        <svg
          width="32"
          height="42"
          viewBox="0 0 31.8044 39.0681"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          overflow="visible"
        >
          <defs>
            <filter id="mb-shadow0" x="1.31838" y="0" width="29.3139" height="12.0532" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
            <filter id="mb-shadow1" x="2.50454" y="12.9697" width="27" height="13.1045" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
            <filter id="mb-shadow2" x="0" y="27.0066" width="31.8044" height="12.0616" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
          </defs>
          <g filter="url(#mb-shadow0)">
            <path d="M3.61413 8.02957L2.50454 1.72957L29.5045 1.02957L28.7648 7.32957L3.61413 8.02957Z" fill="white" />
            <path d="M3.61413 8.02957L2.50454 1.72957L29.5045 1.02957L28.7648 7.32957L3.61413 8.02957Z" stroke="black" strokeWidth="2" />
          </g>
          <g filter="url(#mb-shadow1)">
            <path d="M3.50454 22.0296V14.0296L28.5045 15.4841V20.9387L3.50454 22.0296Z" fill="white" />
            <path d="M3.50454 22.0296V14.0296L28.5045 15.4841V20.9387L3.50454 22.0296Z" stroke="black" strokeWidth="2" />
          </g>
          <g filter="url(#mb-shadow2)">
            <path d="M1.50454 35.0296L4.06336 28.7664L28.7987 28.0296L30.5045 34.2927L1.50454 35.0296Z" fill="white" />
            <path d="M1.50454 35.0296L4.06336 28.7664L28.7987 28.0296L30.5045 34.2927L1.50454 35.0296Z" stroke="black" strokeWidth="2" />
          </g>
        </svg>
      )}
    </button>
  );
}
