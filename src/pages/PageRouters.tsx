import React, { Suspense, useEffect, useState } from 'react';
import { IonSpinner, IonText } from '@ionic/react';
import { 
    getPageConfig, 
    hasAccess, 
    NotFoundPage, 
    AccessDeniedPage
} from './PageConfig';
import { PageRouterProps, RouteState } from './pageTypes';

const PageRouter: React.FC<PageRouterProps> = ({ name, userRole }) => {
    const [routeState, setRouteState] = useState<RouteState>({
        isLoading: true,
        hasAccess: false,
        pageExists: false
    });

    useEffect(() => {
        // Симулируем загрузку и проверку доступа
        const checkRoute = async () => {
            setRouteState({ isLoading: true, hasAccess: false, pageExists: false });
            
            // Небольшая задержка для плавности
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const pageConfig = getPageConfig(name);
            const pageExists = !!pageConfig;
            const userHasAccess = pageExists ? hasAccess(name, userRole) : false;
            
            setRouteState({
                isLoading: false,
                hasAccess: userHasAccess,
                pageExists,
                error: !pageExists ? 'Страница не найдена' : 
                       !userHasAccess ? 'Нет доступа к странице' : undefined
            });
        };

        checkRoute();
    }, [name, userRole]);

    // Состояние загрузки
    if (routeState.isLoading) {
        return <PageLoadingFallback />;
    }

    // Страница не существует
    if (!routeState.pageExists) {
        return <NotFoundPage />;
    }

    // Нет доступа к странице
    if (!routeState.hasAccess) {
        return <AccessDeniedPage userRole={userRole} pageName={name} />;
    }

    // Получаем конфигурацию страницы
    const pageConfig = getPageConfig(name);
    if (!pageConfig) {
        return <NotFoundPage />;
    }

    // Рендерим компонент страницы с Suspense
    const PageComponent = pageConfig.component;
    
    return (
        <Suspense fallback={<PageLoadingFallback />}>
            <PageComponent />
        </Suspense>
    );
};

// Компонент загрузки по умолчанию
const PageLoadingFallback: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            gap: '16px'
        }}>
            <IonSpinner name="crescent" />
            <IonText color="medium">
                <p>Загрузка страницы...</p>
            </IonText>
        </div>
    );
};

export default PageRouter;