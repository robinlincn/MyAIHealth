
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { saasNavLinks, type SaasNavItem } from '@/lib/saas-nav-links'; // Corrected import path
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import React, { useState } from 'react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void; 
}

const NavLink: React.FC<{ item: SaasNavItem; currentPath: string; onClick?: () => void; isSubItem?: boolean }> = ({ item, currentPath, onClick, isSubItem = false }) => {
  // Active state should consider the (admin) group for exact parent matches
  const normalizedCurrentPath = currentPath; // No need to normalize (admin) out of path for matching

  const [isExpanded, setIsExpanded] = useState(normalizedCurrentPath.startsWith(item.href)); 
  
  const isActive = (!item.children && normalizedCurrentPath === item.href) || 
                   (item.children && normalizedCurrentPath === item.href); 
  const isParentActive = item.children && normalizedCurrentPath.startsWith(item.href);


  const handleToggleExpand = (e: React.MouseEvent) => {
    if (item.children) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick(); // Close mobile sidebar on item click
    }
  };

  return (
    <li>
      <Link
        href={item.href} 
        onClick={handleToggleExpand}
        className={`flex items-center justify-between rounded-md py-2.5 text-sm font-medium transition-colors
          ${isSubItem ? 'pl-10 pr-3' : 'px-3'}
          ${isActive || (isParentActive && !isSubItem) ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted hover:text-foreground'}`}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`h-5 w-5 ${isActive || (isParentActive && !isSubItem) ? 'text-primary' : 'text-muted-foreground'}`} />
          <span>{item.title}</span>
        </div>
        {item.children && (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
      </Link>
      {item.children && isExpanded && (
        <ul className="mt-1 space-y-1">
          {item.children.map((child) => (
            <NavLink key={child.href} item={child} currentPath={currentPath} onClick={onClick} isSubItem={true} />
          ))}
        </ul>
      )}
    </li>
  );
};

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  
  const groupedLinks = saasNavLinks.reduce((acc, link) => {
    const groupLabel = link.label || 'General';
    if (!acc[groupLabel]) {
      acc[groupLabel] = [];
    }
    acc[groupLabel].push(link);
    return acc;
  }, {} as Record<string, SaasNavItem[]>);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose}></div>}
      
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 transform flex-col border-r border-border bg-background transition-transform duration-300 ease-in-out md:translate-x-0 
        ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center border-b border-border px-4"> {/* Reduced padding for longer title */}
          <Link href="/saas-admin" className="text-lg font-bold text-primary whitespace-nowrap"> {/* Adjusted font size */}
            AI慢病SAAS管理平台
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {Object.entries(groupedLinks).map(([label, links]) => (
              <React.Fragment key={label}>
                {label !== 'General' && (
                  <li className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </li>
                )}
                {links.map((item) => (
                  <NavLink key={item.href} item={item} currentPath={pathname} onClick={onClose} />
                ))}
              </React.Fragment>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-border p-4">
          <Link
            href="/saas-admin/login" 
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <span>退出登录</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

