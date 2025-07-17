import React from 'react';
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonText,
    IonSkeletonText,
    IonItem,
    IonLabel,
    IonList
} from '@ionic/react';
import {
    alertCircleOutline,
    lockClosedOutline,
    homeOutline,
    arrowBackOutline,
    refreshOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router';
import { UserRole } from '../../pages/pageTypes';

// ============================================
// СТРАНИЦА 404 - НЕ НАЙДЕНО
// ============================================

export const NotFoundPage: React.FC = () => {
    const history = useHistory();

    const goHome = () => {
        history.replace('/');
    };

    const goBack = () => {
        history.goBack();
    };

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="error-page">
                    <IonCard>
                        <IonCardContent className="error-content">
                            <div className="error-icon">
                                <IonIcon icon={alertCircleOutline} />
                            </div>
                            <h1>404</h1>
                            <h2>Страница не найдена</h2>
                            <p>
                                Запрашиваемая страница не существует или была перемещена.
                                Проверьте правильность адреса.
                            </p>
                            <div className="error-actions">
                                <IonButton
                                    expand="block"
                                    onClick={goHome}
                                    className="primary-action"
                                >
                                    <IonIcon icon={homeOutline} slot="start" />
                                    На главную
                                </IonButton>
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={goBack}
                                    className="secondary-action"
                                >
                                    <IonIcon icon={arrowBackOutline} slot="start" />
                                    Назад
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

// ============================================
// СТРАНИЦА ОТКАЗА В ДОСТУПЕ
// ============================================

interface AccessDeniedProps {
    userRole: UserRole;
    pageName: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedProps> = ({ userRole, pageName }) => {
    const history = useHistory();

    const goToDefaultPage = () => {
        const defaultPage = 'invoices';
        history.replace(`/page/${defaultPage}`);
    };

    const goBack = () => {
        history.goBack();
    };

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="error-page">
                    <IonCard>
                        <IonCardContent className="error-content">
                            <div className="error-icon access-denied">
                                <IonIcon icon={lockClosedOutline} />
                            </div>
                            <h1>Доступ запрещен</h1>
                            <h2>У вас нет прав для просмотра этой страницы</h2>
                            <div className="access-info">
                                <IonText color="medium">
                                    <p>
                                        <strong>Ваша роль:</strong> { "master" }
                                    </p>
                                    <p>
                                        <strong>Запрашиваемая страница:</strong> {pageName}
                                    </p>
                                </IonText>
                            </div>
                            <p>
                                Обратитесь к системному администратору, если считаете, 
                                что у вас должен быть доступ к этой странице.
                            </p>
                            <div className="error-actions">
                                <IonButton
                                    expand="block"
                                    onClick={goToDefaultPage}
                                    className="primary-action"
                                >
                                    <IonIcon icon={homeOutline} slot="start" />
                                    Перейти на главную страницу
                                </IonButton>
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={goBack}
                                    className="secondary-action"
                                >
                                    <IonIcon icon={arrowBackOutline} slot="start" />
                                    Назад
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

// ============================================
// СТРАНИЦА ЗАГРУЗКИ (СКЕЛЕТОН)
// ============================================

export const LoadingPage: React.FC = () => {
    return (
        <IonPage>
            <IonContent>
                {/* Скелетон заголовка */}
                <div className="loading-header">
                    <IonSkeletonText animated style={{ width: '40%', height: '28px' }} />
                </div>

                {/* Скелетон контента */}
                <div className="loading-content ion-padding">
                    <IonCard>
                        <IonCardContent>
                            <IonSkeletonText animated style={{ width: '80%', height: '20px' }} />
                            <IonSkeletonText animated style={{ width: '60%', height: '16px', marginTop: '10px' }} />
                            <IonSkeletonText animated style={{ width: '70%', height: '16px', marginTop: '5px' }} />
                        </IonCardContent>
                    </IonCard>

                    <IonList>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <IonItem key={item}>
                                <IonLabel>
                                    <IonSkeletonText animated style={{ width: '50%', height: '16px' }} />
                                    <IonSkeletonText animated style={{ width: '80%', height: '14px', marginTop: '5px' }} />
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                </div>
            </IonContent>
        </IonPage>
    );
};

// ============================================
// СТИЛИ ДЛЯ СТРАНИЦ ОШИБОК
// ============================================

const errorPageStyles = `
.error-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    padding: 20px;
}

.error-content {
    text-align: center;
    padding: 40px 20px;
    max-width: 500px;
}

.error-icon {
    font-size: 80px;
    color: var(--ion-color-danger);
    margin-bottom: 20px;
}

.error-icon.access-denied {
    color: var(--ion-color-warning);
}

.error-content h1 {
    font-size: 72px;
    font-weight: bold;
    color: var(--ion-color-danger);
    margin: 0;
    line-height: 1;
}

.error-content h2 {
    font-size: 24px;
    color: var(--ion-color-dark);
    margin: 20px 0;
    font-weight: 600;
}

.error-content p {
    color: var(--ion-color-medium);
    line-height: 1.6;
    margin: 20px 0;
}

.access-info {
    background: var(--ion-color-light);
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
}

.error-actions {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.primary-action {
    --background: var(--ion-color-primary);
}

.secondary-action {
    --border-color: var(--ion-color-medium);
    --color: var(--ion-color-medium);
}

.loading-header {
    padding: 20px;
    border-bottom: 1px solid var(--ion-color-step-100);
}

.loading-content {
    padding-top: 20px;
}

@media (max-width: 576px) {
    .error-content {
        padding: 30px 15px;
    }
    
    .error-icon {
        font-size: 60px;
    }
    
    .error-content h1 {
        font-size: 56px;
    }
    
    .error-content h2 {
        font-size: 20px;
    }
}
`;

// Внедряем стили
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = errorPageStyles;
    document.head.appendChild(style);
}

export default { NotFoundPage, AccessDeniedPage, LoadingPage };