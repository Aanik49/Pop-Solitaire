import React, { useState } from 'react';
import { Download, Smartphone, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../audio/soundEngine';

interface PWAInstallButtonProps {
  compact?: boolean;
  showGuideFallback?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  showGuideFallback = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    soundEngine.playButton();
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  if (!isInstallable && !isIOS && !showGuideFallback) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`pop-btn bg-[#FFE600] text-[#0D0D0D] font-bangers tracking-wider rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-1.5 text-sm sm:text-base' : 'px-4 py-2.5 text-lg'
        }`}
        title="Install POP! Solitaire on your device"
      >
        {isIOS ? <Smartphone className="w-4 h-4 shrink-0" strokeWidth={2.6} /> : <Download className="w-4 h-4 shrink-0" strokeWidth={2.6} />}
        <span>{isInstallable ? 'Install App' : 'Mobile App'}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-[10050] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="pop-panel bg-[#FFFDF7] rounded-2xl max-w-sm w-full p-6 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                soundEngine.playButton();
                setShowGuideModal(false);
              }}
              aria-label="Close install instructions"
              className="pop-btn absolute top-3.5 right-3.5 w-9 h-9 bg-[#FF1E42] text-white rounded-lg flex items-center justify-center"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>

            <div className="flex items-center gap-4 mb-4 pr-8">
              <div className="w-16 h-16 rounded-2xl border-[3px] border-[#0D0D0D] shadow-[3px_3px_0_#0D0D0D] overflow-hidden shrink-0 bg-[#00D2FF]">
                <img
                  src="/pwa-192x192.png"
                  alt="POP! Solitaire Home Screen Icon"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bangers text-2xl text-[#0D0D0D] tracking-wide leading-tight">
                  Add to Home Screen
                </h3>
                <p className="text-xs font-bold text-[#1D4ED8] mt-0.5">
                  Play fullscreen with your mobile icon
                </p>
              </div>
            </div>

            {isIOS ? (
              <ol className="space-y-2.5 text-sm font-semibold text-[#0D0D0D] mb-5">
                <li className="flex items-start gap-2">
                  <span className="font-bangers text-base bg-[#FFE600] border-2 border-[#0D0D0D] rounded px-1.5 leading-snug shrink-0">1</span>
                  <span>
                    Tap the <strong className="inline-flex items-center gap-0.5 text-[#1D4ED8]">Share <Share className="w-3.5 h-3.5 inline" /></strong> button in your Safari toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bangers text-base bg-[#FFE600] border-2 border-[#0D0D0D] rounded px-1.5 leading-snug shrink-0">2</span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bangers text-base bg-[#FFE600] border-2 border-[#0D0D0D] rounded px-1.5 leading-snug shrink-0">3</span>
                  <span>
                    Tap <strong>Add</strong> to pin the <strong>POP! Cards</strong> icon to your phone.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-sm font-semibold text-[#0D0D0D] mb-5">
                <li className="flex items-start gap-2">
                  <span className="font-bangers text-base bg-[#FFE600] border-2 border-[#0D0D0D] rounded px-1.5 leading-snug shrink-0">1</span>
                  <span>
                    Open your browser menu (<strong>⋮</strong> on Android Chrome or <strong>Share</strong> on iOS Safari).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bangers text-base bg-[#FFE600] border-2 border-[#0D0D0D] rounded px-1.5 leading-snug shrink-0">2</span>
                  <span>
                    Choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bangers text-base bg-[#FFE600] border-2 border-[#0D0D0D] rounded px-1.5 leading-snug shrink-0">3</span>
                  <span>
                    Launch <strong>POP! Cards</strong> straight from your home screen — works offline too!
                  </span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playButton();
                setShowGuideModal(false);
              }}
              className="pop-btn w-full bg-[#00E676] text-[#0D0D0D] font-bangers text-xl py-2 rounded-xl tracking-wider"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
