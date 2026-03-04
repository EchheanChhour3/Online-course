"use client";

import { motion } from "framer-motion";
import { ProfileForm } from "@/components/settings";

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <ProfileForm />
    </motion.div>
  );
}
