import React, { useState } from 'react';
import { 
    IonButton, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonToast, 
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import { 
    documentTextOutline, 
    powerOutline, 
    lockClosedOutline, 
    businessOutline, 
    homeOutline, 
    warningOutline,
    arrowBackOutline,
    saveOutline,
    closeOutline,
    cameraOutline
} from 'ionicons/icons';
import { Invoice } from './types';
import ActShutdownForm from '../Acts/ActShutdown/ActShutdownForm';
import './Invoices.css';
import ActPlomb from '../Acts/ActPlomb/Actplomb';

interface InvoiceActsProps {
    invoice: Invoice;
}

// Типы актов
type ActType = 'list' | 'work_completed' | 'shutdown_order' | 'sealing' | 'mkd_inspection' | 'private_inspection' | 'prescription';

// Конфигурация кнопок актов
const actButtons = [
    {
        type: 'work_completed' as ActType,
        title: 'Акт выполненных работ',
        description: 'Документ о выполнении технических работ',
        icon: documentTextOutline,
        color: 'primary'
    },
    {
        type: 'shutdown_order' as ActType,
        title: 'Акт-наряд на отключение',
        description: 'Распоряжение на отключение газоснабжения',
        icon: powerOutline,
        color: 'warning'
    },
    {
        type: 'sealing' as ActType,
        title: 'Акт пломбирования',
        description: 'Документ об установке пломб на оборудование',
        icon: lockClosedOutline,
        color: 'secondary'
    },
    {
        type: 'mkd_inspection' as ActType,
        title: 'Акт проверки МКД',
        description: 'Проверка многоквартирного дома',
        icon: businessOutline,
        color: 'tertiary'
    },
    {
        type: 'private_inspection' as ActType,
        title: 'Акт проверки частники',
        description: 'Проверка частного домовладения',
        icon: homeOutline,
        color: 'success'
    },
    {
        type: 'prescription' as ActType,
        title: 'Предписание',
        description: 'Документ с требованиями по устранению нарушений',
        icon: warningOutline,
        color: 'danger'
    }
];

export const InvoiceActs: React.FC<InvoiceActsProps> = ({ invoice }) => {
    const [currentView, setCurrentView] = useState<ActType>('list');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleCameraCapture = () => {
        setToastMessage('Функция сканирования будет реализована');
        setShowToast(true);
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
        setToastMessage(`Акт-наряд №${data.act_number || 'б/н'} успешно сохранен`);
        setShowToast(true);
        setCurrentView('list');
    };

    // Обработчик отмены создания акта отключения
    const handleCancelShutdownAct = () => {
        setCurrentView('list');
    };

    // Обработчики для других типов актов (заглушки)
    const handleSaveAct = () => {
        setToastMessage('Акт сохранен (заглушка)');
        setShowToast(true);
        setCurrentView('list');
    };

    const handleCancelAct = () => {
        setCurrentView('list');
    };

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
                                    <IonCol size="12">
                                        <IonButton
                                            expand="block"
                                            fill="outline"
                                            color={button.color}
                                            onClick={() => handleActButtonClick(button.type)}
                                            className="act-button"
                                        >
                                            <IonIcon icon={button.icon} slot="start" />
                                            <div className="act-button-content">
                                                <div className="act-button-title">{button.title}</div>
                                                <div className="act-button-description">{button.description}</div>
                                            </div>
                                        </IonButton>
                                    </IonCol>
                                </IonRow>
                            ))}
                        </IonGrid>

                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <IonButton
                                        expand="block"
                                        fill="clear"
                                        color="medium"
                                        onClick={handleCameraCapture}
                                    >
                                        <IonIcon icon={cameraOutline} slot="start" />
                                        Сканировать QR-код
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            </div>
        </div>
    );

    // Базовый компонент формы акта (для других типов актов)
    const ActForm: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="invoice-page">
            <div className="invoice-page-header">
                <h2 className="invoice-page-title">{title}</h2>
                <p className="invoice-page-subtitle">Заявка #{invoice.number}</p>
            </div>

            <div className="invoice-page-content">
                <IonCard>
                    <IonCardContent>
                        {children}
                        
                        {/* Кнопки управления */}
                        <div className="act-form-buttons">
                            <IonButton
                                expand="block"
                                onClick={handleSaveAct}
                                color="primary"
                            >
                                <IonIcon icon={saveOutline} slot="start" />
                                Сохранить
                            </IonButton>
                            
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={handleCancelAct}
                                color="medium"
                            >
                                <IonIcon icon={closeOutline} slot="start" />
                                Отмена
                            </IonButton>
                            
                            <IonButton
                                expand="block"
                                fill="clear"
                                onClick={handleBackToList}
                                color="medium"
                            >
                                <IonIcon icon={arrowBackOutline} slot="start" />
                                Назад к списку
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>
        </div>
    );

    // Заглушки форм актов
    const WorkCompletedForm = () => (
        <ActForm title="Акт выполненных работ">
            <IonItem>
                <IonLabel position="stacked">Дата выполнения работ</IonLabel>
                <IonDatetime />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Вид выполненных работ</IonLabel>
                <IonSelect>
                    <IonSelectOption value="maintenance">Техническое обслуживание</IonSelectOption>
                    <IonSelectOption value="repair">Ремонт</IonSelectOption>
                    <IonSelectOption value="installation">Установка</IonSelectOption>
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Описание работ</IonLabel>
                <IonTextarea rows={4} placeholder="Подробное описание выполненных работ..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Исполнитель</IonLabel>
                <IonInput placeholder="ФИО исполнителя" />
            </IonItem>
        </ActForm>
    );

    const SealingForm = () => (
        <ActForm title="Акт пломбирования">
            <IonItem>
                <IonLabel position="stacked">Дата пломбирования</IonLabel>
                <IonDatetime />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Номера пломб</IonLabel>
                <IonInput placeholder="Номера установленных пломб" />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Пломбируемые узлы</IonLabel>
                <IonTextarea rows={3} placeholder="Описание пломбируемых узлов и оборудования..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Причина пломбирования</IonLabel>
                <IonTextarea rows={2} placeholder="Основание для установки пломб..." />
            </IonItem>
        </ActForm>
    );

    const MkdInspectionForm = () => (
        <ActForm title="Акт проверки МКД">
            <IonItem>
                <IonLabel position="stacked">Дата проверки</IonLabel>
                <IonDatetime />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Тип проверки</IonLabel>
                <IonSelect>
                    <IonSelectOption value="planned">Плановая</IonSelectOption>
                    <IonSelectOption value="unplanned">Внеплановая</IonSelectOption>
                    <IonSelectOption value="control">Контрольная</IonSelectOption>
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Проверяемые помещения</IonLabel>
                <IonTextarea rows={3} placeholder="Список проверенных помещений..." />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Выявленные нарушения</IonLabel>
                <IonTextarea rows={4} placeholder="Описание выявленных нарушений..." />
            </IonItem>
        </ActForm>
    );

    const PrivateInspectionForm = () => (
        <ActForm title="Акт проверки частники">
            <IonItem>
                <IonLabel position="stacked">Дата проверки</IonLabel>
                <IonDatetime />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Собственник</IonLabel>
                <IonInput placeholder="ФИО собственника" />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Присутствовал при проверке</IonLabel>
                <IonSelect>
                    <IonSelectOption value="owner">Собственник</IonSelectOption>
                    <IonSelectOption value="representative">Представитель</IonSelectOption>
                    <IonSelectOption value="absent">Отсутствовал</IonSelectOption>
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Результат проверки</IonLabel>
                <IonTextarea rows={4} placeholder="Подробные результаты проверки..." />
            </IonItem>
        </ActForm>
    );

    const PrescriptionForm = () => (
        <ActForm title="Предписание">
            <IonItem>
                <IonLabel position="stacked">Дата выдачи</IonLabel>
                <IonDatetime />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Номер предписания</IonLabel>
                <IonInput placeholder="Номер предписания" />
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Основание</IonLabel>
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
                return <WorkCompletedForm />;
            case 'shutdown_order':
                return (
                    <ActShutdownForm 
                        invoiceId={invoice.id}  // 🎯 Передача ID заявки
                        onSave={handleSaveShutdownAct}
                        onCancel={handleCancelShutdownAct}
                    />
                );
            case 'sealing':
                return <ActPlomb 
                    invoiceId={invoice.id}  // 🎯 Передача ID заявки
                    onSave={handleSaveShutdownAct}
                    onCancel={handleCancelShutdownAct}
                />;

            case 'mkd_inspection':
                return <MkdInspectionForm />;

            case 'private_inspection':
                return <PrivateInspectionForm />;

            case 'prescription':
                return <PrescriptionForm />;

            default:
                return <ActButtonsList />;
        }
    };

    return (
        <>
            {renderCurrentView()}
            
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
            />
        </>
    );
};

export default InvoiceActs;