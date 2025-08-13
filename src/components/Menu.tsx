import React from 'react';
import {
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonBadge,
    IonAvatar,
    IonText,
    IonButton
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { logOutOutline, personOutline, businessOutline } from 'ionicons/icons';
import { useStoreField, Store } from '../components/Store';
import { getMenuItems, getRoleDisplayName, getPageConfig } from '../pages/PageConfig';
import { UserRole } from '../pages/pageTypes';
import './Menu.css';

const Menu: React.FC = () => {
    const location = useLocation();
    
    // Получаем данные пользователя из Store
    const loginData = useStoreField('login', 4);
    const userRole = loginData?.role as UserRole;
    const userName = loginData?.fullName || 'Пользователь';

    // Получаем пункты меню для текущей роли
    const menuItems = userRole ? getMenuItems(userRole) : [];
    console.log( menuItems)
    // Обработчик выхода
    const handleLogout = () => {
        // Очищаем Store
        Store.dispatch({ type: 'auth', data: false });
        Store.dispatch({ type: 'login', data: { userId: "", fullName: "", role: "", token: "" } });
        
        // Очищаем localStorage
        localStorage.removeItem('auth');
        localStorage.removeItem('loginData');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('rememberedPhone');
        
        // Перезагружаем страницу для возврата к форме входа
        window.location.reload();
    };

    // Получаем активную страницу из URL
    const getActivePage = (): string => {
        const pathParts = location.pathname.split('/');
        return pathParts[pathParts.length - 1] || '';
    };

    const activePage = getActivePage();

    if (!userRole) {
        return (
            <IonMenu contentId="main" type="overlay" className="menu-corporate">
                <IonContent>
                    <div className="menu-loading">
                        <div className="loading-skeleton" style={{ width: '150px', height: '20px', marginBottom: '10px' }}></div>
                        <div className="loading-skeleton" style={{ width: '100px', height: '16px' }}></div>
                    </div>
                </IonContent>
            </IonMenu>
        );
    }

    // Объединяем все пункты меню в один массив
    const allMenuPages = menuItems.reduce((acc, group) => [...acc, ...group.pages], [] as string[]);
    console.log( allMenuPages )

    return (
        <IonMenu contentId="main" type="overlay" className="menu-corporate">
            <IonContent>
                {/* Заголовок меню с информацией о пользователе */}
                <div className="menu-header">
                    <div className="menu-company-logo">
                        <IonIcon icon={businessOutline} />
                        <div className="company-info">
                            <h3>САХАТРАНСНЕФТЕГАЗ</h3>
                            <p>Мобильный сотрудник</p>
                        </div>
                    </div>
                    
                    <IonList id="user-info" className="user-info-list">
                        <IonItem lines="none" className="user-item">
                            <IonAvatar slot="start" className="user-avatar">
                                <IonIcon icon={personOutline} />
                            </IonAvatar>
                            <IonLabel>
                                <h2 className="user-name">{userName}</h2>
                                <p className="user-role">{getRoleDisplayName(userRole)}</p>
                            </IonLabel>
                        </IonItem>
                    </IonList>
                </div>

                {/* Основное меню - все пункты в одном списке */}
                <div className="menu-content">
                    <IonList className="menu-group">
                        {/* Все страницы приложения */}
                        {allMenuPages.map((pageName) => {
                            console.log( pageName )
                            const pageConfig = getPageConfig(pageName);
                            if (!pageConfig) return null;

                            const isSelected = activePage === pageName;
                            const pageUrl = `/page/${pageName}`;

                            return (
                                <IonMenuToggle key={pageName} autoHide={false}>
                                    <IonItem
                                        className={`menu-item ${isSelected ? 'selected' : ''}`}
                                        routerLink={pageUrl}
                                        routerDirection="none"
                                        lines="none"
                                        detail={false}
                                        button
                                    >
                                        <IonIcon
                                            aria-hidden="true"
                                            slot="start"
                                            icon={pageConfig.icon}
                                            className="menu-item-icon"
                                        />
                                        <IonLabel className="menu-item-label">
                                            {pageConfig.title}
                                        </IonLabel>
                                        {pageConfig.badge && (
                                            <IonBadge 
                                                className="menu-badge"
                                                slot="end"
                                            >
                                                {pageConfig.badge}
                                            </IonBadge>
                                        )}
                                    </IonItem>
                                </IonMenuToggle>
                            );
                        })}
                        
                        {/* Кнопка выхода */}
                        <IonMenuToggle autoHide={false}>
                            <IonItem
                                button
                                onClick={handleLogout}
                                lines="none"
                                className="menu-item logout-item"
                            >
                                <IonIcon
                                    aria-hidden="true"
                                    slot="start"
                                    icon={logOutOutline}
                                    className="menu-item-icon"
                                />
                                <IonLabel className="menu-item-label">
                                    Выйти
                                </IonLabel>
                            </IonItem>
                        </IonMenuToggle>
                    </IonList>
                </div>

                {/* Футер с информацией о приложении */}
                <div className="menu-footer">
                    <div className="app-info">
                        <IonText className="app-text">
                            <p className="app-name">Мобильный сотрудник</p>
                            <p className="app-version">Версия 1.0.0</p>
                        </IonText>
                    </div>
                    <div className="company-footer">
                        <IonText className="company-text">
                            <p className="company-name">АО "Сахатранснефтегаз"</p>
                            <p className="company-year">© 2025</p>
                        </IonText>
                    </div>
                </div>
            </IonContent>
        </IonMenu>
    );
};

export default Menu;