"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(countdownSeconds);
    }
  }, [isOpen, countdownSeconds]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const isButtonDisabled = timeLeft > 0;
  const currentPrimaryButtonText = isButtonDisabled 
    ? `${primaryButtonText} (${timeLeft}s)` 
    : primaryButtonText;

  const currentPrimaryButtonClasses = isButtonDisabled
    ? disabledButtonClasses
    : primaryButtonClasses;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      {isOverlay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Modal Dialog Card */}
      <div
        className={`relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 ${className.replace(/absolute\s+[^\s]+/g, '').replace(/absolute/g, '')}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-base font-bold mb-2 ${titleClasses}`}>{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={primaryButtonAction}
            disabled={isButtonDisabled}
            className={`rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors shadow-sm ${currentPrimaryButtonClasses}`}
          >
            {currentPrimaryButtonText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
