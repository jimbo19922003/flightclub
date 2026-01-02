"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Plane, 
  Calendar, 
  Wrench, 
  CreditCard, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Reservations", href: "/reservations", icon: Calendar },
  { name: "Aircraft", href: "/aircraft", icon: Plane },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">Flight Club</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                    "mr-3 h-6 w-6 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4">
        <button className="flex w-full items-center px-2 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-md">
            <LogOut className="mr-3 h-6 w-6 text-slate-400 group-hover:text-white" />
            Sign Out
        </button>
      </div>
    </div>
  );
}
