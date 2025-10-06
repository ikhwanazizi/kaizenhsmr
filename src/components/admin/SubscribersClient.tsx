// src/components/admin/SubscribersClient.tsx
"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { type Subscriber } from "@/app/admin/subscribers/page";
import { Download, UserX, AlertCircle } from "lucide-react";

// Helper to format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to generate a status badge with appropriate colors
const StatusBadge = ({
  status,
}: {
  status: "subscribed" | "unverified" | "unsubscribed";
}) => {
  const baseClasses =
    "inline-block px-2.5 py-1 text-xs font-medium rounded-full";
  let colorClasses = "";
  let text = status.charAt(0).toUpperCase() + status.slice(1);

  switch (status) {
    case "subscribed":
      colorClasses =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      break;
    case "unverified":
      colorClasses =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      break;
    case "unsubscribed":
      colorClasses =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{text}</span>;
};

export default function SubscribersClient({
  initialSubscribers,
}: {
  initialSubscribers: Subscriber[];
}) {
  const [subscribers, setSubscribers] =
    useState<Subscriber[]>(initialSubscribers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Function to handle unsubscribing a user
  const handleUnsubscribe = async (id: string) => {
    setError(null);
    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "unsubscribed" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update subscriber.");
      }

      const updatedSubscriber = await response.json();
      setSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === updatedSubscriber.id ? updatedSubscriber : sub
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    setLoading(true);
    setError(null);

    if (subscribers.length === 0) {
      setError("No subscribers to export.");
      setLoading(false);
      return;
    }

    // 1. We no longer filter, and we map all the data we want
    const allSubscriberData = subscribers.map((s) => ({
      email: s.email,
      status: s.status,
      subscribed_at: formatDate(s.created_at),
      verified_at: formatDate(s.verified_at),
    }));

    // 2. Update the header to include all new columns
    const csvHeader = "email,status,subscribed_at,verified_at\n";

    // 3. Update the rows to match the new columns
    const csvRows = allSubscriberData
      .map(
        (row) =>
          `"${row.email}","${row.status}","${row.subscribed_at}","${row.verified_at}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `all_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoading(false);
  };

  const columns: Column<Subscriber>[] = [
    { key: "email", label: "Email", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "created_at",
      label: "Subscribed At",
      sortable: true,
      render: (item) => formatDate(item.created_at),
    },
    {
      key: "verified_at",
      label: "Verified At",
      sortable: true,
      render: (item) => formatDate(item.verified_at),
    },
  ];

  const actions = (item: Subscriber) => (
    <div className="flex justify-end items-center gap-2">
      {confirmingId === item.id ? (
        <>
          <span className="text-sm">Are you sure?</span>
          <button
            onClick={() => handleUnsubscribe(item.id)}
            className="font-bold text-red-600 hover:underline text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmingId(null)}
            className="font-bold hover:underline text-sm"
          >
            No
          </button>
        </>
      ) : (
        <>
          {item.status !== "unsubscribed" && (
            <button
              onClick={() => setConfirmingId(item.id)}
              className="p-2 text-slate-500 rounded-md hover:bg-red-100 hover:text-red-600 dark:hover:bg-slate-700 transition-colors"
              title="Unsubscribe user"
            >
              <UserX size={18} />
            </button>
          )}
        </>
      )}
    </div>
  );

  const headerActions = (
    <button
      onClick={handleDownloadCSV}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait"
    >
      <Download size={16} />
      Download CSV
    </button>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
      </div>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2"
          role="alert"
        >
          <AlertCircle size={20} />
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 font-bold"
          >
            ×
          </button>
        </div>
      )}
      <DataTable
        data={subscribers}
        columns={columns}
        searchable={true}
        searchKeys={["email"]}
        pagination={true}
        itemsPerPage={15}
        actions={actions}
        headerActions={headerActions}
        emptyMessage="No subscribers found."
      />
    </div>
  );
}
