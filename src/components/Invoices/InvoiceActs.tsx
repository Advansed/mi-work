import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonLabel, IonList, IonToast, IonFab, IonFabButton } from '@ionic/react';
import { documentOutline, cameraOutline, downloadOutline, addOutline } from 'ionicons/icons';
import { Invoice } from './types';
import './Invoices.css';

interface InvoiceActsProps {
    invoice: Invoice;
}

// Заглушка для актов - в реальном приложении будет загружаться с сервера
const mockActs = [
    {
        id: '1',
        name: 'Акт выполненных работ',
        date: '2024-07-20',
        type: 'work_completed',
        url: '#'
    },
    {
        id: '2', 
        name: 'Предписание №123',
        date: '2024-07-21',
        type: 'prescription',
        url: '#'
    }
];

export const InvoiceActs: React.FC<InvoiceActsProps> = ({ invoice }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleCameraCapture = () => {
        // В реальном приложении здесь будет логика фотографирования
        setToastMessage('Функция сканирования будет реализована');
        setShowToast(true);
    };

    const handleDownload = (actName: string) => {
        setToastMessage(`Скачивание "${actName}"`);
        setShowToast(true);
    };

    const handleAddAct = () => {
        setToastMessage('Добавление нового акта');
        setShowToast(true);
    };

    return (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">Акты и документы</h2>
                <p className="invoice-page-subtitle">Заявка #{invoice.number}</p>
            </div>

            <div className="invoice-page-content">
                {/* Список актов */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Загруженные документы</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {mockActs.length > 0 ? (
                            <IonList>
                                {mockActs.map(act => (
                                    <IonItem key={act.id}>
                                        <IonIcon icon={documentOutline} slot="start" />
                                        <IonLabel>
                                            <h3>{act.name}</h3>
                                            <p>Создан: {new Date(act.date).toLocaleDateString('ru-RU')}</p>
                                        </IonLabel>
                                        <IonButton 
                                            fill="clear" 
                                            slot="end"
                                            onClick={() => handleDownload(act.name)}
                                        >
                                            <IonIcon icon={downloadOutline} slot="icon-only" />
                                        </IonButton>
                                    </IonItem>
                                ))}
                            </IonList>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)', padding: '20px' }}>
                                Документы не загружены
                            </p>
                        )}
                    </IonCardContent>
                </IonCard>

                {/* Инструкции */}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Работа с документами</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem>
                                <IonLabel>
                                    <h3>Сканирование актов</h3>
                                    <p>Используйте камеру для фотографирования документов</p>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <h3>Создание предписаний</h3>
                                    <p>Автоматическое заполнение данных по абоненту</p>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <h3>Добавление оборудования</h3>
                                    <p>Внесение нового газового оборудования</p>
                                </IonLabel>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>
            </div>

            {/* Плавающая кнопка для добавления */}
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton onClick={handleAddAct}>
                    <IonIcon icon={addOutline} />
                </IonFabButton>
            </IonFab>

            {/* Кнопка сканирования */}
            <div style={{ padding: '16px' }}>
                <IonButton 
                    expand="block" 
                    onClick={handleCameraCapture}
                >
                    <IonIcon icon={cameraOutline} slot="start" />
                    Сканировать документ
                </IonButton>
            </div>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
            />
        </div>
    );
};