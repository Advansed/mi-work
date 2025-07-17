import React from 'react';
import { 
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonMenuButton, 
    IonPage, 
    IonTitle, 
    IonToolbar,
    IonBadge,
    IonIcon
} from '@ionic/react';
import { useParams } from 'react-router';
import { useStoreField } from '../components/Store';
import { getPageTitle, getPageConfig } from './PageConfig';
import PageRouter from './PageRouters';
import { UserRole } from './pageTypes';

const Page: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    
    // Получаем данные пользователя из Store
    const loginData = useStoreField('login', 3);
    const userRole = loginData?.role as UserRole;

    // Получаем конфигурацию страницы для заголовка
    const pageConfig = getPageConfig(name);
    const pageTitle = getPageTitle(name);

    // Если нет данных о пользователе, показываем загрузку
    if (!loginData || !userRole) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>Загрузка...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <p>Загрузка данных пользователя...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>
                        <div className="page-title">
                            {pageConfig?.icon && (
                                <IonIcon icon={pageConfig.icon} className="page-title-icon" />
                            )}
                            <span>{pageTitle}</span>
                            {pageConfig?.badge && (
                                <IonBadge color="danger" className="page-title-badge">
                                    {pageConfig.badge}
                                </IonBadge>
                            )}
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                {/* Collapsible header для больших экранов */}
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">
                            <div className="page-title-large">
                                {pageConfig?.icon && (
                                    <IonIcon icon={pageConfig.icon} className="page-title-icon-large" />
                                )}
                                <div className="page-title-content">
                                    <span className="page-title-text">{pageTitle}</span>
                                    {pageConfig?.description && (
                                        <span className="page-title-description">
                                            {pageConfig.description}
                                        </span>
                                    )}
                                </div>
                                {pageConfig?.badge && (
                                    <IonBadge color="danger" className="page-title-badge-large">
                                        {pageConfig.badge}
                                    </IonBadge>
                                )}
                            </div>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>

                {/* Основной контент страницы */}
                <PageRouter name={name} userRole={userRole} />
            </IonContent>
        </IonPage>
    );
};

// ============================================
// СТИЛИ ДЛЯ ЗАГОЛОВКОВ СТРАНИЦ
// ============================================

const pageStyles = `
.page-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-title-icon {
    font-size: 20px;
    color: var(--ion-color-primary);
}

.page-title-badge {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
    margin-left: 4px;
}

.page-title-large {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.page-title-icon-large {
    font-size: 32px;
    color: var(--ion-color-primary);
    min-width: 32px;
}

.page-title-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.page-title-text {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
}

.page-title-description {
    font-size: 14px;
    color: var(--ion-color-medium);
    font-weight: 400;
    margin-top: 4px;
    line-height: 1.3;
}

.page-title-badge-large {
    font-size: 12px;
    min-width: 20px;
    height: 20px;
    align-self: flex-start;
}

/* Адаптивность */
@media (max-width: 576px) {
    .page-title-large {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .page-title-content {
        width: 100%;
    }
    
    .page-title-text {
        font-size: 24px;
    }
    
    .page-title-description {
        font-size: 13px;
    }
    
    .page-title-badge-large {
        align-self: flex-end;
        margin-top: -24px;
    }
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
    .page-title-description {
        color: var(--ion-color-medium-shade);
    }
}
`;

// Внедряем стили
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = pageStyles;
    document.head.appendChild(style);
}

export default Page;