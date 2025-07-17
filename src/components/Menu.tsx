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
    IonText
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { logOutOutline, personOutline } from 'ionicons/icons';
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
            <IonMenu contentId="main" type="overlay">
                <IonContent>
                    <div className="menu-loading">
                        <p>Загрузка меню...</p>
                    </div>
                </IonContent>
            </IonMenu>
        );
    }

    return (
        <IonMenu contentId="main" type="overlay">
            <IonContent>
                {/* Заголовок меню с информацией о пользователе */}
                <div className="menu-header">
                    <IonList id="user-info">
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

                {/* Основное меню */}
                {menuItems.map((group, groupIndex) => (
                    <IonList key={groupIndex} className="menu-group">
                        <IonListHeader>{group.title}</IonListHeader>
                        
                        {group.pages.map((pageName) => {
                            const pageConfig = getPageConfig(pageName);
                            if (!pageConfig) return null;

                            const isSelected = activePage === pageName;
                            const pageUrl = `/page/${pageName}`;

                            return (
                                <IonMenuToggle key={pageName} autoHide={false}>
                                    <IonItem
                                        className={isSelected ? 'selected' : ''}
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
                                        />
                                        <IonLabel>{pageConfig.title}</IonLabel>
                                        {pageConfig.badge && (
                                            <IonBadge 
                                                color="danger" 
                                                slot="end"
                                                className="menu-badge"
                                            >
                                                {pageConfig.badge}
                                            </IonBadge>
                                        )}
                                    </IonItem>
                                </IonMenuToggle>
                            );
                        })}
                    </IonList>
                ))}

                {/* Системные действия */}
                <IonList className="menu-system">
                    <IonListHeader>Система</IonListHeader>
                    
                    <IonMenuToggle autoHide={false}>
                        <IonItem
                            button
                            onClick={handleLogout}
                            lines="none"
                            className="logout-item"
                        >
                            <IonIcon
                                aria-hidden="true"
                                slot="start"
                                icon={logOutOutline}
                            />
                            <IonLabel>Выйти</IonLabel>
                        </IonItem>
                    </IonMenuToggle>
                </IonList>

                {/* Футер с информацией о приложении */}
                <div className="menu-footer">
                    <IonText color="medium">
                        <p className="app-name">Мобильный сотрудник</p>
                        <p className="app-version">Версия 1.0.0</p>
                        <p className="company-name">АО "Сахатранснефтегаз"</p>
                    </IonText>
                </div>
            </IonContent>
        </IonMenu>
    );
};

export default Menu;