import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Slide-in from right (sidebar panels) ──────────────────────────── */

export function SlideInRight({
  children,
  show = true,
  className = "",
}: {
  children: ReactNode;
  show?: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Scale-in (modals, overlays) ───────────────────────────────────── */

export function ScaleIn({
  children,
  show = true,
  className = "",
}: {
  children: ReactNode;
  show?: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Fade-in (generic) ─────────────────────────────────────────────── */

export function FadeIn({
  children,
  show = true,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  show?: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
