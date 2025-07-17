import React from 'react';
import {
    homeOutline,
    documentTextOutline,
    constructOutline,
    buildOutline,
    calendarOutline,
    peopleOutline,
    chatbubbleOutline,
    personOutline,
    statsChartOutline,
    settingsOutline
} from 'ionicons/icons';
import { PageConfigMap, UserRole, PageName, MenuGroup, UserAccess, PageConfig } from './pageTypes';

// ============================================
// ЛЕНИВАЯ ЗАГРУЗКА КОМПОНЕНТОВ
// ============================================

// Основные страницы
//const DashboardPage = React.lazy(() => import('../components/Dashboard/DashboardPage'));
const InvoicesPage = React.lazy(() => import('../components/Invoices/InvoicesPage'));
// const MaintenancePage = React.lazy(() => import('../components/Maintenance/MaintenancePage'));
// const RepairsPage = React.lazy(() => import('../components/Repairs/RepairsPage'));
// const SchedulePage = React.lazy(() => import('../components/Schedule/SchedulePage'));
// const SubscribersPage = React.lazy(() => import('../components/Subscribers/SubscribersPage'));
// const ChatPage = React.lazy(() => import('../components/Chat/ChatPage'));
// const ProfilePage = React.lazy(() => import('../components/Profile/ProfilePage'));
// const ReportsPage = React.lazy(() => import('../components/Reports/ReportsPage'));
// const SettingsPage = React.lazy(() => import('../components/Settings/SettingsPage'));

// Служебные страницы - импортируем напрямую из-за специфики использования
import { NotFoundPage, AccessDeniedPage, LoadingPage } from '../components/Common/NotFoundPages';

// ============================================
// КОНФИГУРАЦИЯ СТРАНИЦ
// ============================================

export const pageConfig: PageConfigMap = {

    // Заявки
    invoices: {
        component: InvoicesPage,
        title: 'Заявки',
        icon: documentTextOutline,
        roles: ['master', 'technician', 'plumber', 'dispatcher', 'subcontractor'],
        description: 'Список активных заявок'
    },

};

// ============================================
// ГРУППИРОВКА МЕНЮ
// ============================================

export const menuGroups: MenuGroup[] = [
    {
        title: 'Основное',
        pages: ['dashboard', 'invoices']
    },
    {
        title: 'Работа',
        pages: ['maintenance', 'repairs', 'schedule']
    },
    {
        title: 'Данные',
        pages: ['subscribers', 'reports']
    },
    {
        title: 'Прочее',
        pages: ['chat', 'profile', 'settings']
    }
];

// ============================================
// ДОСТУПЫ ПО РОЛЯМ
// ============================================

export const roleAccess: Record<UserRole, UserAccess> = {
    master: {
        role: 'master',
        allowedPages: [ 'invoices' ],
        defaultPage: 'invoices'
    },
    
    technician: {
        role: 'technician',
        allowedPages: [ 'invoices' ],
        defaultPage: 'invoices'
    },
    
    plumber: {
        role: 'plumber',
        allowedPages: [ 'invoices' ],
        defaultPage: 'invoices'
    },
    
    dispatcher: {
        role: 'dispatcher',
        allowedPages: ['invoices'],
        defaultPage: 'invoices'
    },
    
    subcontractor: {
        role: 'subcontractor',
        allowedPages: ['invoices'],
        defaultPage: 'invoices'
    }
};

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

export const getPageConfig = (pageName: string): PageConfig | null => {
    return pageConfig[pageName] || null;
};

export const hasAccess = (pageName: string, userRole: UserRole): boolean => {
    const config = getPageConfig(pageName);
    if (!config) return false;
    return config.roles.includes(userRole);
};

export const getDefaultPage = (userRole: UserRole): PageName => {
    return roleAccess[userRole]?.defaultPage || 'invoices';
};

export const getAllowedPages = (userRole: UserRole): PageName[] => {
    return roleAccess[userRole]?.allowedPages || [];
};

export const getMenuItems = (userRole: UserRole) => {
    const allowedPages = getAllowedPages(userRole);
    
    return menuGroups.map(group => ({
        ...group,
        pages: group.pages.filter(page => allowedPages.includes(page))
    })).filter(group => group.pages.length > 0);
};

export const getPageTitle = (pageName: string): string => {
    const config = getPageConfig(pageName);
    return config?.title || 'Страница не найдена';
};

export const getRoleDisplayName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
        master: 'Мастер',
        technician: 'Техник',
        plumber: 'Слесарь',
        dispatcher: 'Диспетчер',
        subcontractor: 'Субподрядчик'
    };
    
    return roleNames[role] || role;
};

// Экспорт служебных компонентов для использования в других местах
export { NotFoundPage, AccessDeniedPage, LoadingPage };