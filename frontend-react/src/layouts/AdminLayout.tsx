import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminTopbar from '../features/admin/components/AdminTopbar';

/**
 * Enterprise Admin Layout
 * Implements persistent navigation, shared state management, 
 * and responsive shell for the SaaS dashboard.
 */
export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FDFEFE]">
      {/* Sidebar - Controlled state for collapsible behavior */}
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Main Container - Natural scrolling beside fixed sidebar */}
      <div 
         className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F9FAFB]/50 transition-all duration-300"
      >
        {/* Top Navigation Hub */}
        <AdminTopbar />

        {/* Action Center - Content area */}
        <main className="flex-1">
          <div className="max-w-[1600px] mx-auto p-8 lg:p-12 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
