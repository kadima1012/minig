import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function AccountPage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // Profile edit state
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteErr, setDeleteErr] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    setProfileLoading(true);

    try {
      const updates: { username?: string; email?: string } = {};
      if (username !== user.username) updates.username = username;
      if (email !== user.email) updates.email = email;

      if (Object.keys(updates).length === 0) {
        setProfileErr("No changes to save");
        setProfileLoading(false);
        return;
      }

      await updateProfile(updates);
      setProfileMsg("Profile updated successfully");
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    if (newPassword !== confirmPassword) {
      setPasswordErr("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordErr(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteErr("");
    setDeleteLoading(true);

    try {
      await deleteAccount({ password: deletePassword });
      navigate("/");
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <Link
            to="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Account Info */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Update Profile */}
        <form onSubmit={handleUpdateProfile} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>

          {profileMsg && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
              {profileMsg}
            </div>
          )}
          {profileErr && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {profileErr}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              minLength={3}
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Change Password</h2>

          {passwordMsg && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
              {passwordMsg}
            </div>
          )}
          {passwordErr && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {passwordErr}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </form>

        {/* Logout */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Delete Account */}
        <div className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
          <p className="text-gray-400 text-sm">
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-semibold rounded-lg transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              {deleteErr && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {deleteErr}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-red-300 mb-1">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={inputClass}
                  placeholder="Your password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteErr(""); }}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || !deletePassword}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {deleteLoading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
