import React from 'react';
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonText,
    IonButton,
    IonList,
    IonItem,
    IonLabel
} from '@ionic/react';
import {
    homeOutline,
    constructOutline,
    buildOutline,
    calendarOutline,
    peopleOutline,
    chatbubbleOutline,
    personOutline,
    statsChartOutline,
    settingsOutline,
    rocketOutline
} from 'ionicons/icons';

// ============================================
// БАЗОВЫЙ КОМПОНЕНТ ЗАГЛУШКИ
// ============================================

interface PlaceholderPageProps {
    title: string;
    icon: string;
    description: string;
    features?: string[];
    comingSoon?: boolean;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
    title,
    icon,
    description,
    features = [],
    comingSoon = true
}) => {
    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="placeholder-page">
                    <IonCard>
                        <IonCardHeader>
                            <div className="placeholder-icon">
                                <IonIcon icon={icon} />
                            </div>
                            <IonCardTitle>{title}</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonText color="medium">
                                <p>{description}</p>
                            </IonText>

                            {features.length > 0 && (
                                <>
                                    <h3>Планируемый функционал:</h3>
                                    <IonList>
                                        {features.map((feature, index) => (
                                            <IonItem key={index} lines="none">
                                                <IonIcon icon={rocketOutline} slot="start" color="primary" />
                                                <IonLabel>{feature}</IonLabel>
                                            </IonItem>
                                        ))}
                                    </IonList>
                                </>
                            )}

                            {comingSoon && (
                                <div className="coming-soon">
                                    <IonText color="primary">
                                        <h4>🚀 Скоро будет готово!</h4>
                                        <p>Эта страница находится в разработке</p>
                                    </IonText>
                                </div>
                            )}
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

// ============================================
// СТРАНИЦА ПАНЕЛИ УПРАВЛЕНИЯ
// ============================================

export const DashboardPage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Панель управления"
            icon={homeOutline}
            description="Центральная панель для мониторинга и управления всеми процессами СТГО."
            features={[
                'Общая статистика по заявкам и работам',
                'Мониторинг производительности сотрудников',
                'Карта с геолокацией бригад',
                'Уведомления о срочных заявках',
                'Сводные отчеты по дням/неделям/месяцам',
                'Быстрый доступ к часто используемым функциям'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ
// ============================================

export const MaintenancePage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Техническое обслуживание"
            icon={constructOutline}
            description="Управление плановым техническим обслуживанием газового оборудования."
            features={[
                'График ТО на месяц с разбивкой по категориям',
                'Ежедневные заявки на ТО (по 10 адресов)',
                'Обзвон абонентов с уведомлениями',
                'Сканирование актов выполненных работ',
                'Добавление нового газового оборудования',
                'Создание и управление предписаниями',
                'QR-коды для оплаты услуг'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА РЕМОНТНЫХ РАБОТ
// ============================================

export const RepairsPage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Ремонтные работы"
            icon={buildOutline}
            description="Управление аварийными и плановыми ремонтными работами."
            features={[
                'Заявки на ремонт с приоритизацией (срочные/несрочные)',
                'Управление статусами заявок',
                'Добавление новых видов услуг',
                'Сканирование документов',
                'Формирование предписаний',
                'Окно оплаты с QR-кодами',
                'Передача заявок между исполнителями'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА ГРАФИКА РАБОТ
// ============================================

export const SchedulePage: React.FC = () => {
    return (
        <PlaceholderPage
            title="График работ"
            icon={calendarOutline}
            description="Планирование и просмотр графиков работ в календарном виде."
            features={[
                'Календарь на год/месяц/неделю',
                'График ТО с загрузкой из 1С РНГ',
                'Распределение заказчиков по техникам',
                'Логистика ТО после обзвона абонентов',
                'Внесение корректировок в график',
                'Планирование даты выезда',
                'Интеграция с картой города'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА АБОНЕНТОВ
// ============================================

export const SubscribersPage: React.FC = () => {
    return (
        <PlaceholderPage
            title="База абонентов"
            icon={peopleOutline}
            description="Управление базой данных абонентов с действующими договорами ТО."
            features={[
                'Списки абонентов по категориям (МКД с плитами, котлами, НСУ, частный сектор)',
                'Информация по лицевым счетам и договорам',
                'Данные о газовом оборудовании',
                'История проведения ТО',
                'Контактная информация с возможностью звонков',
                'Задолженности по ТО',
                'Поиск и фильтрация абонентов'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА ЧАТА
// ============================================

export const ChatPage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Чат сотрудников"
            icon={chatbubbleOutline}
            description="Система внутренней связи между сотрудниками для координации работ."
            features={[
                'Общий чат всех сотрудников',
                'Групповые чаты по бригадам',
                'Личные сообщения',
                'Прикрепление фотографий и документов',
                'Уведомления о новых сообщениях',
                'История переписки',
                'Админские права для мастеров'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА ПРОФИЛЯ
// ============================================

export const ProfilePage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Профиль пользователя"
            icon={personOutline}
            description="Настройки профиля и персональная информация сотрудника."
            features={[
                'Персональные данные сотрудника',
                'Смена пароля и PIN-кода',
                'Настройки уведомлений',
                'История активности',
                'Статистика выполненных работ',
                'Настройки приложения',
                'Контактная информация'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА ОТЧЕТОВ
// ============================================

export const ReportsPage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Отчеты и аналитика"
            icon={statsChartOutline}
            description="Создание сводных отчетов и анализ производственных показателей."
            features={[
                'Сводные таблицы по дням/неделям/месяцам/годам',
                'Статистика заявок на ТО по статусам и исполнителям',
                'Статистика заявок на ремонт',
                'Производительность сотрудников',
                'Анализ задолженностей',
                'Экспорт отчетов в Excel/PDF',
                'Графики и диаграммы'
            ]}
        />
    );
};

// ============================================
// СТРАНИЦА НАСТРОЕК
// ============================================

export const SettingsPage: React.FC = () => {
    return (
        <PlaceholderPage
            title="Настройки системы"
            icon={settingsOutline}
            description="Административные настройки системы (только для мастеров)."
            features={[
                'Управление пользователями',
                'Настройки ролей и доступов',
                'Конфигурация уведомлений',
                'Настройки интеграции с 1С',
                'Управление справочниками',
                'Настройки геолокации',
                'Резервное копирование данных'
            ]}
        />
    );
};

// ============================================
// СТИЛИ ДЛЯ ЗАГЛУШЕК
// ============================================

const placeholderStyles = `
.placeholder-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.placeholder-icon {
    text-align: center;
    margin-bottom: 20px;
}

.placeholder-icon ion-icon {
    font-size: 80px;
    color: var(--ion-color-primary);
}

.placeholder-page ion-card-title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 0;
}

.placeholder-page h3 {
    color: var(--ion-color-primary);
    margin: 30px 0 15px 0;
    font-size: 18px;
}

.coming-soon {
    text-align: center;
    margin-top: 30px;
    padding: 20px;
    background: var(--ion-color-primary-tint);
    border-radius: 12px;
}

.coming-soon h4 {
    margin: 0 0 10px 0;
    font-size: 18px;
}

.coming-soon p {
    margin: 0;
    font-size: 14px;
}

@media (max-width: 576px) {
    .placeholder-page {
        padding: 15px;
    }
    
    .placeholder-icon ion-icon {
        font-size: 60px;
    }
    
    .placeholder-page ion-card-title {
        font-size: 20px;
    }
}
`;

// Внедряем стили
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = placeholderStyles;
    document.head.appendChild(style);
}

export default {
    DashboardPage,
    MaintenancePage,
    RepairsPage,
    SchedulePage,
    SubscribersPage,
    ChatPage,
    ProfilePage,
    ReportsPage,
    SettingsPage
};