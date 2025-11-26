"use client";

import {
  X,
  Mail,
  Phone,
  Building,
  Users,
  Calendar,
  MessageCircle,
  Send,
  ExternalLink,
  History,
  Edit,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Contact = {
  id: string;
  full_name: string;
  business_email: string;
  contact_number: string;
  company: string;
  company_size: string;
  message: string;
  status: string;
  created_at: string;
  last_reply_at?: string | null;
};

type Reply = {
  id: string;
  reply_message: string;
  reply_method: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

type ContactDetailModalProps = {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: "admin" | "super_admin" | null;
  onRefresh: () => void;
  // Added onStatusChange prop
  onStatusChange?: (id: string, status: string) => void;
};

export default function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  userRole,
  onRefresh,
  onStatusChange,
}: ContactDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [mounted, setMounted] = useState(false);

  // State for status editing
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(contact?.status || "");

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal status with prop
  useEffect(() => {
    if (contact) {
      setCurrentStatus(contact.status);
    }
  }, [contact]);

  // Close modal on ESC key and lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onClose]);

  // Fetch replies when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      fetchReplies();
    }
  }, [isOpen, contact]);

  const fetchReplies = async () => {
    if (!contact) return;

    setLoadingReplies(true);
    try {
      const response = await fetch(
        `/api/admin/contacts/reply?contactId=${contact.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!contact) return;

    try {
      const response = await fetch("/api/admin/contacts/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setCurrentStatus(newStatus);
        setIsEditingStatus(false);
        if (onStatusChange) {
          onStatusChange(contact.id, newStatus);
        }
        onRefresh(); // Refresh parent data too
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating status");
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !contact) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/admin/contacts/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          replyMessage: replyMessage.trim(),
          replyMethod: "in_app",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Reply sent successfully!");
        setReplyMessage("");
        setShowReplyForm(false);
        fetchReplies();
        // Automatically update status to 'replied' if it was 'new' or 'contacted'
        if (contact.status === "new" || contact.status === "contacted") {
          handleStatusUpdate("replied");
        } else {
          onRefresh();
        }
      } else {
        alert(data.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("An error occurred while sending the reply");
    } finally {
      setIsSending(false);
    }
  };

  const handleEmailClientReply = () => {
    if (!contact) return;

    const subject = encodeURIComponent("Re: Your KaizenHR Inquiry");
    const body = encodeURIComponent(
      `Dear ${contact.full_name},\n\nThank you for contacting KaizenHR.\n\n\n\nBest regards,\nKaizenHR Team`
    );

    window.open(
      `mailto:${contact.business_email}?subject=${subject}&body=${body}`,
      "_blank"
    );

    // Prompt to log the reply
    setTimeout(() => {
      const note = prompt(
        "Please enter a brief note about your reply for tracking purposes:"
      );
      if (note && note.trim()) {
        logEmailReply(note.trim());
      }
    }, 2000);
  };

  const logEmailReply = async (note: string) => {
    if (!contact) return;

    try {
      const response = await fetch("/api/admin/contacts/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          replyMessage: note,
          replyMethod: "email_client",
        }),
      });

      if (response.ok) {
        fetchReplies();
        // Automatically update status to 'replied'
        if (contact.status === "new" || contact.status === "contacted") {
          handleStatusUpdate("replied");
        } else {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error logging reply:", error);
    }
  };

  if (!mounted || !isOpen || !contact) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-MY", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Kuala_Lumpur",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      contacted:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      replied:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      closed:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    );
  };

  const displayedReplies = showAllReplies ? replies : replies.slice(0, 1);

  const modalContent = (
    <>
      {/* Backdrop - Full Screen Fixed */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Modal Wrapper */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-4xl bg-white rounded-lg shadow-2xl dark:bg-gray-800 my-8 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Contact Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-grow">
            {/* Status Badge & Edit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleStatusUpdate(currentStatus)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingStatus(false);
                        setCurrentStatus(contact.status);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                        contact.status
                      )}`}
                    >
                      {contact.status.charAt(0).toUpperCase() +
                        contact.status.slice(1)}
                    </span>
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Change Status"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                )}
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="inline w-4 h-4 mr-1" />
                {formatDate(contact.created_at)}
              </span>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/50">
                <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  Full Name
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {contact.full_name}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/50">
                <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </div>
                <a
                  href={`mailto:${contact.business_email}`}
                  className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {contact.business_email}
                </a>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/50">
                <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Number
                </div>
                <a
                  href={`tel:${contact.contact_number}`}
                  className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {contact.contact_number}
                </a>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/50">
                <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <Building className="w-4 h-4 mr-2" />
                  Company
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {contact.company}
                </p>
              </div>

              <div className="col-span-1 p-4 bg-gray-50 rounded-lg md:col-span-2 dark:bg-gray-900/50">
                <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  Company Size
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {contact.company_size} employees
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/50">
              <div className="flex items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </div>
              <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                {contact.message || "No message provided."}
              </p>
            </div>

            {/* Reply History */}
            {replies.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    <History className="inline w-5 h-5 mr-2" />
                    Reply History
                  </h3>
                  {replies.length > 1 && (
                    <button
                      onClick={() => setShowAllReplies(!showAllReplies)}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {showAllReplies
                        ? "Show Latest Only"
                        : `View All ${replies.length} Replies`}
                    </button>
                  )}
                </div>

                {loadingReplies ? (
                  <p className="text-sm text-gray-500">Loading replies...</p>
                ) : (
                  <div className="space-y-3">
                    {displayedReplies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-4 border-l-4 border-green-500 bg-green-50 rounded-lg dark:bg-green-900/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-green-800 dark:text-green-400">
                            {reply.reply_method === "in_app"
                              ? "📧 In-App Reply"
                              : "✉️ Email Client"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                          {reply.reply_message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By {reply.profiles.full_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reply Section (Super Admin Only) */}
            {userRole === "super_admin" && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                {!showReplyForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReplyForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Send size={16} />
                      Quick Reply (In-App)
                    </button>
                    <button
                      onClick={handleEmailClientReply}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <ExternalLink size={16} />
                      Reply via Email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Send Reply
                      </h3>
                      <button
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyMessage("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={6}
                      placeholder="Type your reply here..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={isSending || !replyMessage.trim()}
                      className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Portal the modal to body to ensure z-index coverage
  return createPortal(modalContent, document.body);
}
