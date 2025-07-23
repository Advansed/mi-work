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
import './Page.css'; // Импорт корпоративных стилей

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
            <IonPage className="page-corporate">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>
                            <div className="page-title">
                                <div className="loading-skeleton" style={{ width: '120px', height: '24px' }}></div>
                            </div>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen className="page-content">
                    <div className="page-card">
                        <div className="loading-skeleton" style={{ width: '200px', height: '20px', marginBottom: '16px' }}></div>
                        <div className="loading-skeleton" style={{ width: '100%', height: '16px', marginBottom: '12px' }}></div>
                        <div className="loading-skeleton" style={{ width: '80%', height: '16px', marginBottom: '12px' }}></div>
                        <div className="loading-skeleton" style={{ width: '60%', height: '16px' }}></div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage className="page-corporate">
            <IonHeader>
                <IonToolbar className="page-header">
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>
                        <div className="page-title">
                            {/* {pageConfig?.icon && ( */}
                                <IonIcon icon={pageConfig?.icon} className="page-title-icon" />
                            {/* )} */}
                            <span>{pageTitle}</span>
                            {/* {pageConfig?.badge && ( */}
                                <IonBadge className="page-title-badge">
                                    {pageConfig?.badge}
                                </IonBadge>
                            {/* )} */}
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="page-content">
                {/* Collapsible header для больших экранов */}
                {/* <IonHeader collapse="condense">
                    <IonToolbar className="page-header">
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
                                    <IonBadge className="page-title-badge-large">
                                        {pageConfig.badge}
                                    </IonBadge>
                                )}
                            </div>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader> */}

                {/* Основной контент страницы */}
                <div className="page-content-wrapper">
                    <PageRouter name={name} userRole={userRole} />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Page;