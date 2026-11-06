"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type AlertType = "error" | "success" | "warning" | "info";

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  closeOnOverlayClick?: boolean;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "error",
  buttonText = "Dismiss",
  closeOnOverlayClick = true
}: AlertModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const config = {
    error: {
      icon: XCircle,
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      defaultTitle: "Something went wrong",
      btnClass: "bg-rose-600 hover:bg-rose-700 text-white"
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      defaultTitle: "Attention Required",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white"
    },
    success: {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      defaultTitle: "Action Successful",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white"
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      defaultTitle: "Notice",
      btnClass: "bg-[#FF6600] hover:bg-[#e65c00] text-white"
    }
  }[type];

  const IconComponent = config.icon;
  const modalTitle = title || config.defaultTitle;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#0000001A] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Close 'X' Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${config.iconBg}`}
          >
            <IconComponent className="h-7 w-7" strokeWidth={2.2} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-garet font-bold text-black mb-2">
            {modalTitle}
          </h3>

          {/* Description / Message */}
          <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 max-h-48 overflow-y-auto px-2">
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full rounded-xl py-2.5 text-xs font-semibold shadow-sm transition-colors ${config.btnClass}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Convenient Hook to trigger alerts easily from any page or component without boilerplate.
 */
export function useAlertModal() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: AlertType;
    buttonText?: string;
  }>({
    isOpen: false,
    message: "",
    type: "error"
  });

  const showAlert = React.useCallback(
    (options: {
      message: string;
      title?: string;
      type?: AlertType;
      buttonText?: string;
    }) => {
      setState({
        isOpen: true,
        message: options.message,
        title: options.title,
        type: options.type ?? "error",
        buttonText: options.buttonText
      });
    },
    []
  );

  const closeAlert = React.useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const stateRef = React.useRef({ state, closeAlert });
  stateRef.current = { state, closeAlert };

  const AlertModalComponent = React.useMemo(() => {
    const Component: React.FC = () => {
      const { state: curState, closeAlert: curClose } = stateRef.current;
      return (
        <AlertModal
          isOpen={curState.isOpen}
          onClose={curClose}
          title={curState.title}
          message={curState.message}
          type={curState.type}
          buttonText={curState.buttonText}
        />
      );
    };
    Component.displayName = "AlertModalComponent";
    return Component;
  }, []);

  return {
    showAlert,
    closeAlert,
    AlertModalComponent,
    isAlertOpen: state.isOpen
  };
}
