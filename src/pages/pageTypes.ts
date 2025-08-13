import React from 'react';

// ============================================
// ТИПЫ ДЛЯ СИСТЕМЫ СТРАНИЦ
// ============================================

export type UserRole = 'master' | 'technician' | 'plumber' | 'dispatcher' | 'subcontractor';

export type PageName = 
    | 'dashboard'
    | 'invoices' 
    | 'lics' 
    | 'maintenance'
    | 'repairs'
    | 'schedule'
    | 'subscribers'
    | 'chats'
    | 'profile'
    | 'reports'
    | 'settings';

export interface PageConfig {
    component: React.ComponentType;
    title: string;
    icon: string;
    roles: UserRole[];
    description?: string;
    badge?: string | number;
    isDefault?: boolean; // Страница по умолчанию для роли
}

export interface PageConfigMap {
    [key: string]: PageConfig;
}

export interface MenuGroup {
    title: string;
    pages: PageName[];
}

export interface UserAccess {
    role: UserRole;
    allowedPages: PageName[];
    defaultPage: PageName;
}

export interface PageRouterProps {
    name: string;
    userRole: UserRole;
}

export interface RouteState {
    isLoading: boolean;
    hasAccess: boolean;
    pageExists: boolean;
    error?: string;
}