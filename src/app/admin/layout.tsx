import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

// NOTE: I've removed the Metadata, fonts, and global CSS import.
// Those should only be in your root layout (src/app/layout.tsx).

// It's good practice to name the layout function based on its purpose.
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The layout should start with a div or fragment, not <html>.
    <div>
      <AdminNavbar />
      <div style={{ display: "flex" }}>
        {/* TODO: This is where you will add your AdminSidebar component later */}
        <AdminSidebar />

        <main style={{ flexGrow: 1, padding: "1rem" }}>
          {children} {/* This is where your page content will be rendered */}
        </main>
      </div>
    </div>
  );
}
