// src/components/Invoices/InvoiceActs.tsx
import React, { useState } from 'react';
import { 
    IonButton, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle, 
    IonCol, 
    IonGrid, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonDatetime
} from '@ionic/react';
import { 
    documentTextOutline, 
    businessOutline, 
    homeOutline, 
    warningOutline,
    cameraOutline 
} from 'ionicons/icons';
import { Invoice } from '../types';
import ActShutdownForm from '../../Acts/ActShutdown/ActShutdownForm';
import ActPlomb from '../../Acts/ActPlomb/ActplombForm';
import { useToast } from '../../Toast/useToast';
import './InvoiceActs.css';
import ActHouseInspects from '../../Acts/ActHouseInspect/ActHouseInspect';
import ActPrescript from '../../Acts/ActPrescript/ActPrescript';
import CompletedForm from '../../Acts/ActCompleted/CompletedForm';

type ActType = 'list' | 'work_completed' | 'shutdown_order' | 'sealing' | 'mkd_inspection' | 'private_inspection' | 'prescription';

interface InvoiceActsProps {
    invoice: Invoice;
}

const actButtons = [
    {
        type: 'work_completed' as ActType,
        name: 'Акт выполненных работ',
        icon: documentTextOutline,
        color: 'primary'
    },
    {
        type: 'shutdown_order' as ActType,
        name: 'Акт-наряд на отключение',
        icon: businessOutline,
        color: 'warning'
    },
    {
        type: 'sealing' as ActType,
        name: 'Акт пломбирования',
        icon: businessOutline,
        color: 'secondary'
    },
    {
        type: 'mkd_inspection' as ActType,
        name: 'Акт обследования МКД',
        icon: homeOutline,
        color: 'tertiary'
    },
    {
        type: 'private_inspection' as ActType,
        name: 'Акт обследования частного дома',
        icon: homeOutline,
        color: 'success'
    },
    {
        type: 'prescription' as ActType,
        name: 'Предписание с требованиями по устранению нарушений',
        icon: warningOutline,
        color: 'danger'
    }
];

export const InvoiceActs: React.FC<InvoiceActsProps> = ({ invoice }) => {
    const [currentView, setCurrentView] = useState<ActType>('list');
    const { showSuccess, showInfo } = useToast();

    const handleCameraCapture = () => {
        showInfo('Функция сканирования будет реализована');
    };

    const handleActButtonClick = (actType: ActType) => {
        setCurrentView(actType);
    };

    const handleBackToList = () => {
        setCurrentView('list');
    };

    // Обработчик сохранения акта отключения
    const handleSaveShutdownAct = (data: any) => {
        console.log('Акт отключения сохранен:', data);
        showSuccess(`Акт-наряд №${data.act_number || 'б/н'} успешно сохранен`);
        setCurrentView('list');
    };

    // Обработчик отмены создания акта отключения
    const handleCancelShutdownAct = () => {
        setCurrentView('list');
    };

    // Обработчики для других типов актов (заглушки)
    const handleSaveAct = () => {
        showSuccess('Акт сохранен (заглушка)');
        setCurrentView('list');
    };

    const handleCancelAct = () => {
        setCurrentView('list');
    };

    // Компонент формы для создания актов (заглушки)
    const ActForm: React.FC<{ children: React.ReactNode; title: string; onSave: () => void; onCancel: () => void }> = ({ 
        children, 
        title, 
        onSave, 
        onCancel 
    }) => (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">{title}</h2>
                <p className="invoice-page-subtitle">Заявка #{invoice.number}</p>
            </div>

            <div className="invoice-page-content">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>{title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {children}
                        
                        <IonGrid className="ion-margin-top">
                            <IonRow>
                                <IonCol size="6">
                                    <IonButton 
                                        expand="block" 
                                        fill="outline"
                                        onClick={onCancel}
                                    >
                                        Отмена
                                    </IonButton>
                                </IonCol>
                                <IonCol size="6">
                                    <IonButton 
                                        expand="block" 
                                        onClick={onSave}
                                    >
                                        Сохранить
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            </div>
        </div>
    );

    // Компонент списка кнопок актов
    const ActButtonsList = () => (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">Акты и документы</h2>
                <p className="invoice-page-subtitle">Заявка #{invoice.number}</p>
            </div>

            <div className="invoice-page-content">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Создание актов</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonGrid>
                            {actButtons.map((button, index) => (
                                <IonRow key={button.type}>
                                    <IonCol>
                                        <IonButton
                                            expand="block"
                                            fill="outline"
                                            color={button.color}
                                            onClick={() => handleActButtonClick(button.type)}
                                            className="act-button"
                                        >
                                            <IonIcon icon={button.icon} slot="start" />
                                            {button.name}
                                        </IonButton>
                                    </IonCol>
                                </IonRow>
                            ))}
                        </IonGrid>

                        <div className="camera-section ion-margin-top">
                            <IonButton
                                expand="block"
                                fill="clear"
                                onClick={handleCameraCapture}
                                className="camera-button"
                            >
                                <IonIcon icon={cameraOutline} slot="start" />
                                Сканировать QR-код документа
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>
        </div>
    );

    // Заглушки для форм актов
    const WorkCompletedForm = () => (
        <ActForm title="Акт выполненных работ" onSave={handleSaveAct} onCancel={handleCancelAct}>
            <IonItem>
                <IonLabel position="stacked">Описание выполненных работ</IonLabel>
                <IonTextarea rows={4} placeholder="Подробное описание..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Дата выполнения</IonLabel>
                <IonDatetime />
            </IonItem>
        </ActForm>
    );

    const MkdInspectionForm = () => (
        <ActForm title="Акт обследования МКД" onSave={handleSaveAct} onCancel={handleCancelAct}>
            <IonItem>
                <IonLabel position="stacked">Результаты обследования</IonLabel>
                <IonTextarea rows={5} placeholder="Описание состояния МКД..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Дата обследования</IonLabel>
                <IonDatetime />
            </IonItem>
        </ActForm>
    );

    const PrivateInspectionForm = () => (
        <ActForm title="Акт обследования частного дома" onSave={handleSaveAct} onCancel={handleCancelAct}>
            <IonItem>
                <IonLabel position="stacked">Результаты обследования</IonLabel>
                <IonTextarea rows={5} placeholder="Описание состояния дома..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Дата обследования</IonLabel>
                <IonDatetime />
            </IonItem>
        </ActForm>
    );

    const PrescriptionForm = () => (
        <ActForm title="Предписание" onSave={handleSaveAct} onCancel={handleCancelAct}>
            <IonItem>
                <IonLabel position="stacked">Основание для выдачи</IonLabel>
                <IonSelect>
                    <IonSelectOption value="inspection">По результатам проверки</IonSelectOption>
                    <IonSelectOption value="complaint">По жалобе</IonSelectOption>
                    <IonSelectOption value="violation">Выявленное нарушение</IonSelectOption>
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Требования к устранению</IonLabel>
                <IonTextarea rows={5} placeholder="Подробное описание требований..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Срок исполнения</IonLabel>
                <IonDatetime />
            </IonItem>
        </ActForm>
    );

    // Рендер компонента в зависимости от текущего состояния
    const renderCurrentView = () => {
        switch (currentView) {
            case 'work_completed':

                return <CompletedForm 
                    invoiceId   = { invoice.id }  // 🎯 Передача ID заявки
                    onSave      = { handleSaveShutdownAct }
                    onCancel    = { handleCancelShutdownAct }
                />
                
            case 'shutdown_order':

                return <ActShutdownForm 
                    invoiceId   = { invoice.id }  // 🎯 Передача ID заявки
                    onSave      = { handleSaveShutdownAct }
                    onCancel    = { handleCancelShutdownAct }
                />

            case 'sealing':

                return <ActPlomb 
                    invoiceId   = { invoice.id }  // 🎯 Передача ID заявки
                    onSave      = { handleSaveShutdownAct }
                    onCancel    = { handleCancelShutdownAct }
                />;

            case 'mkd_inspection':

                return <MkdInspectionForm />;

            case 'private_inspection':

                return <ActHouseInspects 
                    invoiceId   = { invoice.id }  // 🎯 Передача ID заявки
                    onSave      = { handleSaveShutdownAct }
                    onCancel    = { handleCancelShutdownAct }                
                />;

            case 'prescription':

                return <ActPrescript />;

            default:

                return <ActButtonsList />;
        }
    };

    return (
        <>
            {renderCurrentView()}
        </>
    );
};

export default InvoiceActs;