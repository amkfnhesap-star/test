"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Eye, EyeOff, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfile, uploadAvatar } from "@/lib/profile";
import type { Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const TABS = ["Profile", "Account", "Notifications", "Danger Zone"] as const;
type Tab = (typeof TABS)[number];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        checked ? "bg-brand-500" : "bg-zinc-300 dark:bg-zinc-600"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xl">
      {initials || "?"}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile section
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Account section
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications section
  const [notifJobResponses, setNotifJobResponses] = useState(true);
  const [notifPlatformUpdates, setNotifPlatformUpdates] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Danger Zone
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getProfile().then(({ profile }) => {
      if (profile) {
        setProfile(profile);
        setFullName(profile.full_name ?? "");
        setCity(profile.city ?? "");
        setPhone(profile.phone ?? "");
        setBio(profile.bio ?? "");
        const notifs = profile.notification_preferences;
        if (notifs) {
          setNotifJobResponses(notifs.job_responses ?? true);
          setNotifPlatformUpdates(notifs.platform_updates ?? true);
          setNotifMarketing(notifs.marketing ?? false);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarFile) {
      const url = await uploadAvatar(avatarFile);
      if (url) avatarUrl = url;
    }

    const { error } = await updateProfile({
      full_name: fullName.trim() || null,
      city: city.trim() || null,
      phone: phone.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
    });

    if (error) {
      toast.error("Failed to save profile.");
    } else {
      toast.success("Profile saved!");
      setProfile((prev) =>
        prev
          ? { ...prev, full_name: fullName, city, phone, bio, avatar_url: avatarUrl }
          : prev
      );
      setAvatarFile(null);
    }
    setSavingProfile(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation email sent — check your inbox.");
      setNewEmail("");
    }
    setSavingEmail(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    const { error } = await updateProfile({
      notification_preferences: {
        job_responses: notifJobResponses,
        platform_updates: notifPlatformUpdates,
        marketing: notifMarketing,
      },
    });
    if (error) {
      toast.error("Failed to save preferences.");
    } else {
      toast.success("Preferences saved!");
    }
    setSavingNotifs(false);
  };

  const handleDeleteAccount = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    if (deleteEmail !== session.user.email) {
      toast.error("Email doesn't match.");
      return;
    }

    setIsDeleting(true);
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    setDeleteModal(false);
    router.push("/");
    toast.success("Account deleted. Goodbye!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? profile?.avatar_url ?? null;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your profile, account, and preferences.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : tab === "Danger Zone"
                  ? "text-red-500 dark:text-red-400 hover:text-red-600"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "Profile" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-6"
          >
            {/* Avatar upload */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
                Profile Photo
              </label>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {avatarSrc ? (
                    <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                      <Image
                        src={avatarSrc}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <AvatarFallback name={fullName || profile?.email || ""} />
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors shadow-md"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Upload a photo
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">JPG or PNG, max 2 MB</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1.5 block"
                  >
                    Choose file
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <Input
              label="Full Name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
            />

            <Input
              label="City"
              placeholder="e.g. București, Cluj-Napoca"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="e.g. +40 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />

            <Textarea
              label="Bio"
              placeholder="Tell others a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              fullWidth
            />

            <Button onClick={handleSaveProfile} isLoading={savingProfile} size="md">
              Save Profile
            </Button>
          </motion.div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === "Account" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Email */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
              <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
                Email Address
              </h2>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Current:</span>
                <span className="text-zinc-900 dark:text-white font-medium">
                  {profile?.email}
                </span>
              </div>
              <Input
                label="New Email Address"
                type="email"
                placeholder="new@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                fullWidth
                hint="A confirmation link will be sent to your new address."
              />
              <Button
                onClick={handleChangeEmail}
                isLoading={savingEmail}
                variant="secondary"
                size="md"
                disabled={!newEmail.trim()}
              >
                Send Confirmation Email
              </Button>
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
              <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
                Change Password
              </h2>
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              <Input
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              <Button
                onClick={handleChangePassword}
                isLoading={savingPassword}
                variant="secondary"
                size="md"
                disabled={!newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === "Notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-6"
          >
            <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
              Email Notifications
            </h2>

            <div className="space-y-5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {[
                {
                  label: "Job responses",
                  description: "Email me when someone responds to my job",
                  value: notifJobResponses,
                  onChange: setNotifJobResponses,
                },
                {
                  label: "Platform updates",
                  description: "Email me about new features and platform updates",
                  value: notifPlatformUpdates,
                  onChange: setNotifPlatformUpdates,
                },
                {
                  label: "Marketing emails",
                  description: "Promotions, tips, and special offers",
                  value: notifMarketing,
                  onChange: setNotifMarketing,
                },
              ].map(({ label, description, value, onChange }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 pt-5 first:pt-0"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {label}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
                  </div>
                  <Toggle checked={value} onChange={onChange} />
                </div>
              ))}
            </div>

            <Button onClick={handleSaveNotifications} isLoading={savingNotifs} size="md">
              Save Preferences
            </Button>
          </motion.div>
        )}

        {/* ── DANGER ZONE TAB ── */}
        {activeTab === "Danger Zone" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-zinc-900 dark:text-white">Delete Account</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
                  Permanently delete your account and all associated data. Your jobs, profile, and
                  settings will be removed immediately. This cannot be undone.
                </p>
                <Button
                  variant="danger"
                  size="md"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  className="mt-4"
                  onClick={() => setDeleteModal(true)}
                >
                  Delete my account
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                    Delete your account?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Permanent — all your data will be removed.
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                Type{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {profile?.email}
                </span>{" "}
                to confirm:
              </p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder={profile?.email ?? ""}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all mb-5"
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  disabled={isDeleting}
                  onClick={() => {
                    setDeleteModal(false);
                    setDeleteEmail("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  isLoading={isDeleting}
                  disabled={deleteEmail !== profile?.email}
                  onClick={handleDeleteAccount}
                >
                  Delete forever
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
