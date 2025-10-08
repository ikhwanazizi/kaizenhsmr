// src/components/admin/ContactDetailModal.tsx
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
  Copy,
  Star,
  StickyNote,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";

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
  is_starred: boolean;
  last_reply_at?: string | null;
};

type Interaction = {
  id: string;
  interaction_type: string;
  content?: string | null;
  old_value?: string | null;
  new_value?: string | null;
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
};

export default function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  userRole,
  onRefresh,
}: ContactDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [showAllInteractions, setShowAllInteractions] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Fetch interactions when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      setIsStarred(contact.is_starred);
      setSelectedStatus(contact.status);
      fetchInteractions();
    }
  }, [isOpen, contact]);

  const fetchInteractions = async () => {
    if (!contact) return;

    setLoadingInteractions(true);
    try {
      const response = await fetch(
        `/api/admin/contacts/interactions?contactId=${contact.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setInteractions(data.interactions || []);
      }
    } catch (error) {
      console.error("Error fetching interactions:", error);
    } finally {
      setLoadingInteractions(false);
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
        fetchInteractions();
        onRefresh();
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

  const handleCopyEmail = async () => {
    if (!contact) return;

    try {
      await navigator.clipboard.writeText(contact.business_email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);

      // Prompt for logging reply
      setTimeout(() => {
        const note = prompt(
          "Please enter a brief note about your reply for tracking purposes:"
        );
        if (note && note.trim()) {
          logEmailClientReply(note.trim());
        }
      }, 500);
    } catch (error) {
      console.error("Failed to copy email:", error);
      alert("Failed to copy email address");
    }
  };

  const logEmailClientReply = async (note: string) => {
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
        fetchInteractions();
        onRefresh();
      }
    } catch (error) {
      console.error("Error logging reply:", error);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !contact) return;

    try {
      const response = await fetch("/api/admin/contacts/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          content: noteContent.trim(),
        }),
      });

      if (response.ok) {
        setNoteContent("");
        setShowNoteForm(false);
        fetchInteractions();
      } else {
        alert("Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("An error occurred while adding note");
    }
  };

  const handleToggleStar = async () => {
    if (!contact) return;

    const newStarred = !isStarred;
    setIsStarred(newStarred);

    try {
      const response = await fetch("/api/admin/contacts/star", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          isStarred: newStarred,
        }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        setIsStarred(!newStarred);
        alert("Failed to update star status");
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      setIsStarred(!newStarred);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!contact || newStatus === contact.status) return;

    // Prevent changing back to "new"
    if (newStatus === "new" && contact.status !== "new") {
      alert("Cannot change status back to 'new'");
      return;
    }

    setSelectedStatus(newStatus);

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
        fetchInteractions();
        onRefresh();
      } else {
        setSelectedStatus(contact.status);
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setSelectedStatus(contact.status);
    }
  };

  const handleCopyEmailInline = async () => {
    if (!contact) return;
    try {
      await navigator.clipboard.writeText(contact.business_email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!isOpen || !contact) return null;

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

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "reply":
        return "✉️";
      case "note":
        return "📝";
      case "status_change":
        return "🔄";
      default:
        return "•";
    }
  };

  const displayedInteractions = showAllInteractions
    ? interactions
    : interactions.slice(0, 3);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-4xl my-8 bg-white rounded-lg shadow-2xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Contact Details
              </h2>
              <button
                onClick={handleToggleStar}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isStarred ? "Remove star" : "Add star"}
              >
                <Star
                  size={20}
                  className={
                    isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }
                />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Status and Date */}
            <div className="flex items-center justify-between gap-4">
              {/* Status Dropdown - Super Admin Only */}
              {userRole === "super_admin" ? (
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-3 py-1 text-sm font-semibold rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusBadge(
                    selectedStatus
                  )}`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                    selectedStatus
                  )}`}
                >
                  {selectedStatus.charAt(0).toUpperCase() +
                    selectedStatus.slice(1)}
                </span>
              )}

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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </div>
                  <button
                    onClick={handleCopyEmailInline}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 transition-colors rounded hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    title="Copy email"
                  >
                    <Copy size={14} />
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
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

            {/* Interaction Timeline */}
            {interactions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    <Clock className="inline w-5 h-5 mr-2" />
                    Activity Timeline
                  </h3>
                  {interactions.length > 3 && (
                    <button
                      onClick={() =>
                        setShowAllInteractions(!showAllInteractions)
                      }
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {showAllInteractions
                        ? "Show Recent"
                        : `View All ${interactions.length} Activities`}
                    </button>
                  )}
                </div>

                {loadingInteractions ? (
                  <p className="text-sm text-gray-500">Loading timeline...</p>
                ) : (
                  <div className="space-y-3">
                    {displayedInteractions.map((interaction) => (
                      <div
                        key={interaction.id}
                        className="p-4 border-l-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">
                            {getInteractionIcon(interaction.interaction_type)}{" "}
                            {interaction.interaction_type === "reply" &&
                              "Reply Sent"}
                            {interaction.interaction_type === "note" &&
                              "Note Added"}
                            {interaction.interaction_type === "status_change" &&
                              "Status Changed"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(interaction.created_at)}
                          </span>
                        </div>

                        {interaction.interaction_type === "status_change" ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Status updated from{" "}
                            <span className="font-semibold">
                              {interaction.old_value}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold">
                              {interaction.new_value}
                            </span>
                          </p>
                        ) : (
                          <div
                            className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: interaction.content || "",
                            }}
                          />
                        )}

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          By {interaction.profiles.full_name}
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
                {!showReplyForm && !showNoteForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReplyForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Send size={16} />
                      Quick Reply (In-App)
                    </button>
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Copy size={16} />
                      Copy Email
                    </button>
                    <button
                      onClick={() => setShowNoteForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-yellow-100 rounded-lg hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                    >
                      <StickyNote size={16} />
                      Add Note
                    </button>
                  </div>
                ) : showReplyForm ? (
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
                    <RichTextEditor
                      value={replyMessage}
                      onChange={setReplyMessage}
                      placeholder="Type your reply here... You can use formatting options above."
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
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Add Note
                      </h3>
                      <button
                        onClick={() => {
                          setShowNoteForm(false);
                          setNoteContent("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                      placeholder="Add a note about client communication, follow-ups, or other important information..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteContent.trim()}
                      className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <StickyNote size={16} />
                      Save Note
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
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
}
