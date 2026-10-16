import React from 'react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonAction: () => void;
  primaryButtonClasses?: string;
  cancelButtonText?: string;
  className?: string;
  isOverlay?: boolean;
  countdownSeconds?: number;
  disabledButtonClasses?: string;
  titleClasses?: string;
}

export function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonClasses = "bg-[#FFF0E5] text-[#FF6600] hover:bg-[#FFE5D6]",
  cancelButtonText = "Cancel",
  className = "",
  isOverlay = true,
  countdownSeconds = 0,
  disabledButtonClasses = "bg-[#8C8C8C] text-white cursor-not-allowed",
  titleClasses = "text-black"
}: ActionModalProps) {
  const [timeLeft, setTimeLeft] = React.useState(countdownSeconds);

  React.useEffect(() => {
    if (isOpen) {
      setTimeLeft(countdownSeconds);
    }
  }, [isOpen, countdownSeconds]);

  React.useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const isButtonDisabled = timeLeft > 0;
  const currentPrimaryButtonText = isButtonDisabled 
    ? `${primaryButtonText} (${timeLeft}s)` 
    : primaryButtonText;

  const currentPrimaryButtonClasses = isButtonDisabled
    ? disabledButtonClasses
    : primaryButtonClasses;
  if (!isOpen) return null;
  return (
    <>
      {isOverlay && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}
      <div className={`w-[400px] rounded-2xl bg-white p-3 shadow-xl border border-[#0000001A] z-50 ${className}`}>
        <h3 className={`text-[15px] font-bold mb-3 ${titleClasses}`}>{title}</h3>
        <p className="text-[13px] text-[#000000CC] mb-4">
          {description}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#F6F6F6] px-5 py-2.5 text-xs font-semibold text-[#000000CC] hover:bg-slate-200 transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={primaryButtonAction}
            disabled={isButtonDisabled}
            className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${currentPrimaryButtonClasses}`}
          >
            {currentPrimaryButtonText}
          </button>
        </div>
      </div>
    </>
  );
}
