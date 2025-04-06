// components/HRSidebar.jsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  ChevronDown,
  Home,
  Plus,
  Eye,
  List,
  PieChart,
  CreditCard,
} from "lucide-react";

// Custom menu item component
interface MenuItemProps {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, icon, children }) => {
  const Icon = icon;
  return (
    <Link
      href={href}
      className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md group"
    >
      {Icon && (
        <Icon className="h-5 w-5 mr-2 text-gray-500 group-hover:text-blue-600" />
      )}
      <span className="text-gray-700 group-hover:text-blue-600">
        {children}
      </span>
    </Link>
  );
};

// Custom sidebar section with collapsible
// Define props interface for SidebarSection
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-gray-200">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
        <span className="font-semibold text-gray-900">{title}</span>
        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default function HRSidebar() {
  return (
    <div className="w-64 h-screen border-r bg-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-700">flowwbook</h1>
      </div>

      {/* Company Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between p-2 border border-gray-300 rounded cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-lg">A</span>
            </div>
            <span className="font-bold text-lg">Atom HR</span>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <SidebarSection title="Home">
          <MenuItem href="/" icon={Home}>
            Home
          </MenuItem>
        </SidebarSection>

        <SidebarSection title="FlowwLitics">
          <MenuItem href="/create-task" icon={Eye}>Check Status</MenuItem>
        </SidebarSection>

        <SidebarSection title="Floww Book">
          <MenuItem href="/create-task" icon={Eye}>Stauts Update</MenuItem>
        </SidebarSection>

        <SidebarSection title="Task">
          <MenuItem href="/create-task" icon={Plus}>
            Create Task
          </MenuItem>
          <MenuItem href="/view-task" icon={Eye}>
            View Task
          </MenuItem>
        </SidebarSection>

        <SidebarSection title="Employee Management">
          <MenuItem href="/add-employee" icon={Plus}>
            Add Employee
          </MenuItem>
          <MenuItem href="/view-employee" icon={Eye}>
            View Employee
          </MenuItem>
        </SidebarSection>

        <SidebarSection title="Attendance Management">
          <MenuItem href="/attendance-list" icon={List}>
            List
          </MenuItem>
          <MenuItem href="/attendance-summary" icon={PieChart}>
            Summary
          </MenuItem>
        </SidebarSection>

        <SidebarSection title="Payroll Management">
          <MenuItem href="/payroll-create" icon={Plus}>
            Create
          </MenuItem>
          <MenuItem href="/payroll-list" icon={List}>
            List
          </MenuItem>
          <MenuItem href="/expense-manager" icon={CreditCard}>
            Expense Manager
          </MenuItem>
        </SidebarSection>
      </div>
    </div>
  );
}
