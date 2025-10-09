// src/app/admin/contacts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import DataTable, { type Column } from "@/components/shared/DataTable";
import ContactDetailModal from "@/components/admin/ContactDetailModal";
import { Eye, Trash2, Download, AlertCircle } from "lucide-react";

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
  reply_note?: string | null;
  replied_at?: string | null;
  replied_by?: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "super_admin" | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    fetchUserRole();
  }, [supabase]);

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/contacts");
      const data = await response.json();

      if (response.ok) {
        setContacts(data.contacts || []);
      } else {
        console.error("Failed to fetch contacts:", data.error);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle view contact
  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  // Handle delete contact
  const handleDelete = async (contact: Contact) => {
    if (
      !confirm(
        `Are you sure you want to delete the contact from ${contact.company}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contacts?id=${contact.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Contact deleted successfully");
        fetchContacts(); // Refresh the list
      } else {
        alert(data.error || "Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("An error occurred while deleting the contact");
    }
  };

  // Handle CSV export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/contacts/export");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to export contacts");
      }
    } catch (error) {
      console.error("Error exporting contacts:", error);
      alert("An error occurred while exporting");
    } finally {
      setIsExporting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
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
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusConfig[status as keyof typeof statusConfig] || statusConfig.new
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Define table columns
  const columns: Column<Contact>[] = [
    {
      key: "full_name",
      label: "Full Name",
      sortable: true,
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
    },
    {
      key: "business_email",
      label: "Email",
      sortable: true,
      render: (contact) => (
        <a
          href={`mailto:${contact.business_email}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          {contact.business_email}
        </a>
      ),
    },
    {
      key: "contact_number",
      label: "Phone",
      render: (contact) => (
        <a
          href={`tel:${contact.contact_number}`}
          className="hover:text-blue-600 dark:hover:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          {contact.contact_number}
        </a>
      ),
    },
    {
      key: "company_size",
      label: "Size",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (contact) => <StatusBadge status={contact.status} />,
    },
    {
      key: "created_at",
      label: "Submitted",
      sortable: true,
      render: (contact) => formatDate(contact.created_at),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading contacts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Contact Submissions
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all contact form submissions from your website
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Contacts
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {contacts.length}
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            New
          </div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {contacts.filter((c) => c.status === "new").length}
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Contacted
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {contacts.filter((c) => c.status === "contacted").length}
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Replied
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {contacts.filter((c) => c.status === "replied").length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={contacts}
        columns={columns}
        searchable={true}
        searchKeys={[
          "full_name",
          "company",
          "business_email",
          "contact_number",
        ]}
        pagination={true}
        itemsPerPage={10}
        onRowClick={handleView}
        actions={(contact) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(contact);
              }}
              className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              title="View details"
            >
              <Eye size={18} />
            </button>
            {userRole === "super_admin" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(contact);
                }}
                className="p-2 text-red-600 transition-colors rounded hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title="Delete contact"
              >
                <Trash2 size={18} />
              </button>
            )}
          </>
        )}
        emptyMessage="No contacts found"
        headerActions={
          <button
            onClick={handleExport}
            disabled={isExporting || contacts.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        }
      />

      {/* Info Card */}
      {contacts.length === 0 && (
        <div className="p-6 text-center bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
            No contacts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contact form submissions will appear here once users start reaching
            out.
          </p>
        </div>
      )}

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContact(null);
        }}
        userRole={userRole}
        onRefresh={fetchContacts}
      />
    </div>
  );
}
