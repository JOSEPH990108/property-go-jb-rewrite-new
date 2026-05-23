// src/stores/ui-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getKLDate } from "@/lib/utils";
import type { AuthMode } from "@/types/auth.types";

interface UIState {
  isLoginOpen: boolean;
  dismissedDate: string | null;
  onboardingDismissedDate: string | null;
  onboardingDismissedUserId: string | null;
  authMode: AuthMode;

  // Actions
  setLoginOpen: (open: boolean, mode?: AuthMode) => void;
  setAuthMode: (mode: AuthMode) => void;
  dismissModal: () => void;
  resetDismissed: () => void;
  dismissOnboardingModal: (userId: string) => void;
  resetOnboardingDismissed: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isLoginOpen: false,
      dismissedDate: null,
      onboardingDismissedDate: null,
      onboardingDismissedUserId: null,
      authMode: "signin",

      setLoginOpen: (open, mode) =>
        set((state) => ({
          isLoginOpen: open,
          authMode: mode ?? state.authMode,
        })),

      setAuthMode: (mode) => set({ authMode: mode }),

      dismissModal: () =>
        set({
          isLoginOpen: false,
          dismissedDate: getKLDate(),
        }),

      resetDismissed: () => set({ dismissedDate: null }),

      dismissOnboardingModal: (userId) =>
        set({
          onboardingDismissedDate: getKLDate(),
          onboardingDismissedUserId: userId,
        }),

      resetOnboardingDismissed: () =>
        set({
          onboardingDismissedDate: null,
          onboardingDismissedUserId: null,
        }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dismissedDate: state.dismissedDate,
        onboardingDismissedDate: state.onboardingDismissedDate,
        onboardingDismissedUserId: state.onboardingDismissedUserId,
      }),
    },
  ),
);
