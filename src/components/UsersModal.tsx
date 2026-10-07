"use client";

// Modal dialog showing organization roster and user profiles
import React from "react";
import { UserItem } from "@/types/neocore";
import { formatDate } from "@/lib/utils";
import { X, Users, Mail, Calendar } from "lucide-react";

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserItem[];
  isLoading: boolean;
}

// Renders the organization users roster modal
export function UsersModal({ isOpen, onClose, users, isLoading }: UsersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Organization Team Roster</h3>
              <p className="text-[11px] text-slate-500">Authorized users in this NeoCore tenant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/30">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading team members...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No users found.</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{user.name || "Unnamed User"}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {user.provider && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                      {user.provider}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <span className="font-mono text-slate-500">ID: {user.id}</span>
                  {user.created_at && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Joined {formatDate(user.created_at)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white rounded-lg transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
