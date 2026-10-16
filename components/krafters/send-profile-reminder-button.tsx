"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ProfileReminderTemplate } from "@/types/admin-users";
import { usersAdminService } from "@/services/users-admin.service";

type SendProfileReminderButtonProps = {
  userId: string;
  disabled?: boolean;
  compact?: boolean;
};

export function SendProfileReminderButton({
  userId,
  disabled = false,
  compact = false
}: SendProfileReminderButtonProps) {
  const queryClient = useQueryClient();
  const [template, setTemplate] = useState<ProfileReminderTemplate>("auto");
  const [feedback, setFeedback] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      usersAdminService.sendProfileReminder(userId, { template }),
    onSuccess: (result) => {
      if (result.sent) {
        setFeedback(`Sent (${result.template ?? template})`);
      } else {
        setFeedback(result.reason ?? "Not sent");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "intent-krafters"] });
    },
    onError: (e: Error) => setFeedback(e.message)
  });

  return (
    <div className={compact ? "inline-flex flex-col gap-1" : "flex min-w-[140px] flex-col gap-1"}>
      <div className="inline-flex items-center gap-2">
        <select
          className="h-7 rounded-md border border-slate-700 bg-slate-950 px-2 text-[10px]"
          value={template}
          disabled={disabled || mutation.isPending}
          onChange={(e) =>
            setTemplate(e.target.value as ProfileReminderTemplate)
          }
          aria-label="Reminder template"
        >
          <option value="auto">Auto</option>
          <option value="1h">1h</option>
          <option value="48h">48h</option>
        </select>
        <button
          type="button"
          disabled={disabled || mutation.isPending}
          onClick={() => {
            setFeedback(null);
            mutation.mutate();
          }}
          className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-200 disabled:opacity-50"
        >
          {mutation.isPending ? "Sending…" : "Send reminder"}
        </button>
      </div>
      {feedback && (
        <span className="text-[10px] text-slate-400" title={feedback}>
          {feedback.length > 56 ? `${feedback.slice(0, 56)}…` : feedback}
        </span>
      )}
    </div>
  );
}
