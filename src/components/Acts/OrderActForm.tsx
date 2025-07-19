import React, { useState, useEffect, useCallback } from 'react';
import {
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonGrid,
    IonRow,
    IonCol,
    IonAccordion,
    IonAccordionGroup,
    IonText,
    IonToast
} from '@ionic/react';
import {
    arrowBackOutline,
    documentTextOutline,
    saveOutline,
    businessOutline,
    personOutline,
    buildOutline,
    checkmarkCircleOutline,
    refreshCircleOutline
} from 'ionicons/icons';
import { PDFGeneratorComponent } from '../PDF';
import { ActOrderData } from '../PDF/types';
import { ActOrderFormData, ActOrderFormProps } from './index';
import './OrderActForm.css';

const ActOrderForm: React.FC<ActOrderFormProps> = ({
    initialData = {},
    onBack,
    isModal = false,
    onDataChange,
    showPDFActions = true
}) => {
    // ============================================
    // СОСТОЯНИЕ ФОРМЫ
    // ============================================
    
    const [formData, setFormData] = useState<ActOrderFormData>({
        actNumber: '',
        date: new Date().toISOString(),
        representative: {
            name: '',
            position: 'Слесарь',
            reason: 'плановое техническое обслуживание'
        },
        order: {
            equipment: 'газовое оборудование',
            apartment: '',
            house: '',
            street: '',
            subscriber: '',
            orderGiver: {
                name: '',
                position: 'Мастер'
            },
            orderReceiver: {
                name: '',
                position: 'Слесарь'
            }
        },
        execution: {
            executor: '',
            executionDate: new Date().toISOString(),
            executionTime: '',
            disconnectedEquipment: '',
            representativeSignature: {
                name: '',
                position: 'Представитель эксплуатационной организации'
            },
            subscriberSignature: {
                name: '',
                position: 'Ответственный квартиросъёмщик (абонент)'
            }
        },
        reconnection: {
            reconnectionDate: '',
            reconnectionBy: '',
            reconnectionOrder: '',
            apartment: '',
            house: '',
            street: '',
            subscriber: '',
            representativeSignature: {
                name: '',
                position: 'Представитель эксплуатационной организации'
            },
            subscriberSignature: {
                name: '',
                position: 'Ответственный квартиросъёмщик (абонент)'
            }
        }
    });

    const [showSaveToast, setShowSaveToast] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'representative', 'order']);

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ И АВТОЗАПОЛНЕНИЕ
    // ============================================

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                representative: {
                    ...prev.representative,
                    ...initialData.representative
                },
                order: {
                    ...prev.order,
                    ...initialData.order,
                    orderGiver: {
                        ...prev.order.orderGiver,
                        ...initialData.order?.orderGiver
                    },
                    orderReceiver: {
                        ...prev.order.orderReceiver,
                        ...initialData.order?.orderReceiver
                    }
                },
                execution: {
                    ...prev.execution,
                    ...initialData.execution,
                    representativeSignature: {
                        ...prev.execution.representativeSignature,
                        ...initialData.execution?.representativeSignature
                    },
                    subscriberSignature: {
                        ...prev.execution.subscriberSignature,
                        ...initialData.execution?.subscriberSignature
                    }
                },
                reconnection: {
                    ...prev.reconnection,
                    ...initialData.reconnection,
                    representativeSignature: {
                        ...prev.reconnection.representativeSignature,
                        ...initialData.reconnection?.representativeSignature
                    },
                    subscriberSignature: {
                        ...prev.reconnection.subscriberSignature,
                        ...initialData.reconnection?.subscriberSignature
                    }
                }
            }));
        }
    }, [initialData]);

    // ============================================
    // ОБРАБОТЧИКИ ИЗМЕНЕНИЙ
    // ============================================

    const updateFormData = useCallback((updates: Partial<ActOrderFormData>) => {
        setFormData(prev => {
            const newData = { ...prev, ...updates };
            
            // Автосохранение
            if (isModal) {
                localStorage.setItem('actOrderFormDraft', JSON.stringify(newData));
            }
            
            // Уведомление родительского компонента
            if (onDataChange) {
                onDataChange(newData);
            }
            
            return newData;
        });
    }, [isModal, onDataChange]);

    const handleBasicChange = (field: keyof Pick<ActOrderFormData, 'actNumber' | 'date'>, value: string) => {
        updateFormData({ [field]: value });
    };

    const handleRepresentativeChange = (field: keyof ActOrderFormData['representative'], value: string) => {
        updateFormData({
            representative: {
                ...formData.representative,
                [field]: value
            }
        });
    };

    const handleOrderChange = (field: keyof ActOrderFormData['order'], value: string) => {
        const updatedOrder = {
            ...formData.order,
            [field]: value
        };

        // Автокопирование адресных данных в секцию подключения
        if (['apartment', 'house', 'street', 'subscriber'].includes(field)) {
            updateFormData({
                order: updatedOrder,
                reconnection: {
                    ...formData.reconnection,
                    [field]: value
                }
            });
        } else {
            updateFormData({ order: updatedOrder });
        }
    };

    const handleOrderSignatureChange = (
        signatureType: 'orderGiver' | 'orderReceiver',
        field: 'name' | 'position',
        value: string
    ) => {
        updateFormData({
            order: {
                ...formData.order,
                [signatureType]: {
                    ...formData.order[signatureType],
                    [field]: value
                }
            }
        });
    };

    const handleExecutionChange = (field: keyof Omit<ActOrderFormData['execution'], 'representativeSignature' | 'subscriberSignature'>, value: string) => {
        updateFormData({
            execution: {
                ...formData.execution,
                [field]: value
            }
        });
    };

    const handleExecutionSignatureChange = (
        signatureType: 'representativeSignature' | 'subscriberSignature',
        field: 'name' | 'position',
        value: string
    ) => {
        updateFormData({
            execution: {
                ...formData.execution,
                [signatureType]: {
                    ...formData.execution[signatureType],
                    [field]: value
                }
            }
        });
    };

    const handleReconnectionChange = (field: keyof Omit<ActOrderFormData['reconnection'], 'representativeSignature' | 'subscriberSignature'>, value: string) => {
        updateFormData({
            reconnection: {
                ...formData.reconnection,
                [field]: value
            }
        });
    };

    const handleReconnectionSignatureChange = (
        signatureType: 'representativeSignature' | 'subscriberSignature',
        field: 'name' | 'position',
        value: string
    ) => {
        updateFormData({
            reconnection: {
                ...formData.reconnection,
                [signatureType]: {
                    ...formData.reconnection[signatureType],
                    [field]: value
                }
            }
        });
    };

    // ============================================
    // УТИЛИТЫ
    // ============================================

    const formatDateForDisplay = (isoDate: string): string => {
        if (!isoDate) return '';
        return new Date(isoDate).toLocaleDateString('ru-RU');
    };

    const formatTimeForDisplay = (time: string): string => {
        if (!time) return '';
        return time.substring(0, 5); // HH:MM
    };

    const convertToPDFData = (): ActOrderData => {
        return {
            actNumber: formData.actNumber,
            date: formData.date,
            representative: formData.representative,
            order: formData.order,
            execution: formData.execution,
            reconnection: formData.reconnection
        };
    };

    // ============================================
    // ДЕЙСТВИЯ
    // ============================================

    const handleSaveDraft = () => {
        localStorage.setItem('actOrderFormDraft', JSON.stringify(formData));
        setShowSaveToast(true);
    };

    const handleAutoFill = () => {
        const currentUser = JSON.parse(localStorage.getItem('loginData') || '{}');
        
        updateFormData({
            representative: {
                ...formData.representative,
                name: currentUser.fullName || formData.representative.name
            },
            order: {
                ...formData.order,
                orderGiver: {
                    name: currentUser.fullName || formData.order.orderGiver.name,
                    position: 'Мастер'
                },
                orderReceiver: {
                    name: formData.representative.name || formData.order.orderReceiver.name,
                    position: 'Слесарь'
                }
            },
            execution: {
                ...formData.execution,
                executor: formData.representative.name || formData.execution.executor,
                representativeSignature: {
                    ...formData.execution.representativeSignature,
                    name: formData.representative.name
                }
            },
            reconnection: {
                ...formData.reconnection,
                reconnectionBy: formData.representative.name || formData.reconnection.reconnectionBy,
                representativeSignature: {
                    ...formData.reconnection.representativeSignature,
                    name: formData.representative.name
                }
            }
        });
    };

    // ============================================
    // РЕНДЕР
    // ============================================

    const containerClass = isModal ? 'act-order-modal' : 'act-order-page';

    return (
        <div className={containerClass}>
            {/* Заголовок - только если не в модальном режиме */}
            {!isModal && (
                <div className="page-header no-print">
                    <h1>АКТ-НАРЯД на отключение газового оборудования</h1>
                    <div className="header-actions">
                        <IonButton fill="outline" onClick={handleSaveDraft}>
                            <IonIcon icon={saveOutline} slot="start" />
                            Сохранить черновик
                        </IonButton>
                    </div>
                </div>
            )}

            {/* Кнопки навигации в модальном режиме */}
            {isModal && onBack && (
                <div className="modal-nav-buttons no-print">
                    <IonButton
                        fill="outline"
                        onClick={onBack}
                        className="back-button"
                    >
                        <IonIcon icon={arrowBackOutline} slot="start" />
                        Назад к заявке
                    </IonButton>
                    <IonButton
                        fill="outline"
                        onClick={handleAutoFill}
                        className="autofill-button"
                    >
                        <IonIcon icon={refreshCircleOutline} slot="start" />
                        Автозаполнение
                    </IonButton>
                </div>
            )}

            <div className={isModal ? 'modal-form-container' : 'form-container'}>
                {/* ЗАГОЛОВОК ОРГАНИЗАЦИИ */}
                <IonCard className="company-header-card">
                    <IonCardHeader>
                        <div className="company-logo">
                            <IonIcon icon={businessOutline} className="logo-icon" />
                            <div className="company-info">
                                <IonCardTitle>САХАТРАНСНЕФТЕГАЗ</IonCardTitle>
                                <p>УСД</p>
                            </div>
                        </div>
                    </IonCardHeader>
                </IonCard>

                {/* ОСНОВНАЯ ФОРМА */}
                <IonAccordionGroup expand="inset" value={expandedSections} onIonChange={(e) => setExpandedSections(e.detail.value)}>
                    
                    {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
                    <IonAccordion value="basic">
                        <IonItem slot="header">
                            <IonIcon icon={documentTextOutline} slot="start" />
                            <IonLabel>
                                <h2>Основная информация</h2>
                                <p>Номер и дата акта-наряда</p>
                            </IonLabel>
                        </IonItem>
                        <IonCardContent slot="content">
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Номер акта-наряда</IonLabel>
                                            <IonInput
                                                value={formData.actNumber}
                                                onIonInput={(e) => handleBasicChange('actNumber', e.detail.value!)}
                                                placeholder="Введите номер"
                                                required
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Дата</IonLabel>
                                            <IonDatetime
                                                value={formData.date}
                                                onIonChange={(e) => handleBasicChange('date', e.detail.value as string)}
                                                presentation="date"
                                                locale="ru-RU"
                                                // placeholder="Выберите дату"
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonAccordion>

                    {/* ПРЕДСТАВИТЕЛЬ */}
                    <IonAccordion value="representative">
                        <IonItem slot="header">
                            <IonIcon icon={personOutline} slot="start" />
                            <IonLabel>
                                <h2>Представитель организации</h2>
                                <p>Информация об исполнителе</p>
                            </IonLabel>
                        </IonItem>
                        <IonCardContent slot="content">
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">ФИО представителя</IonLabel>
                                            <IonInput
                                                value={formData.representative.name}
                                                onIonInput={(e) => handleRepresentativeChange('name', e.detail.value!)}
                                                placeholder="Введите ФИО"
                                                required
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Должность</IonLabel>
                                            <IonInput
                                                value={formData.representative.position}
                                                onIonInput={(e) => handleRepresentativeChange('position', e.detail.value!)}
                                                placeholder="Введите должность"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Причина отключения</IonLabel>
                                            <IonTextarea
                                                value={formData.representative.reason}
                                                onIonInput={(e) => handleRepresentativeChange('reason', e.detail.value!)}
                                                placeholder="Укажите причину"
                                                rows={3}
                                                autoGrow
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonAccordion>

                    {/* ЗАДАНИЕ НА ОТКЛЮЧЕНИЕ */}
                    <IonAccordion value="order">
                        <IonItem slot="header">
                            <IonIcon icon={buildOutline} slot="start" />
                            <IonLabel>
                                <h2>Задание на отключение</h2>
                                <p>Адрес и оборудование</p>
                            </IonLabel>
                        </IonItem>
                        <IonCardContent slot="content">
                            <IonGrid>
                                {/* Адрес */}
                                <IonRow>
                                    <IonCol size="12">
                                        <IonText color="primary">
                                            <h3>Адрес объекта</h3>
                                        </IonText>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="4">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Улица</IonLabel>
                                            <IonInput
                                                value={formData.order.street}
                                                onIonInput={(e) => handleOrderChange('street', e.detail.value!)}
                                                placeholder="Название улицы"
                                                required
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="6" sizeMd="4">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Дом</IonLabel>
                                            <IonInput
                                                value={formData.order.house}
                                                onIonInput={(e) => handleOrderChange('house', e.detail.value!)}
                                                placeholder="№ дома"
                                                required
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="6" sizeMd="4">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Квартира</IonLabel>
                                            <IonInput
                                                value={formData.order.apartment}
                                                onIonInput={(e) => handleOrderChange('apartment', e.detail.value!)}
                                                placeholder="№ квартиры"
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                {/* Абонент и оборудование */}
                                <IonRow>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">ФИО абонента</IonLabel>
                                            <IonInput
                                                value={formData.order.subscriber}
                                                onIonInput={(e) => handleOrderChange('subscriber', e.detail.value!)}
                                                placeholder="Введите ФИО абонента"
                                                required
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Оборудование для отключения</IonLabel>
                                            <IonInput
                                                value={formData.order.equipment}
                                                onIonInput={(e) => handleOrderChange('equipment', e.detail.value!)}
                                                placeholder="Наименование приборов"
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                {/* Подписи */}
                                <IonRow>
                                    <IonCol size="12">
                                        <IonText color="primary">
                                            <h3>Подписи</h3>
                                        </IonText>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Наряд выдал (ФИО)</IonLabel>
                                            <IonInput
                                                value={formData.order.orderGiver.name}
                                                onIonInput={(e) => handleOrderSignatureChange('orderGiver', 'name', e.detail.value!)}
                                                placeholder="ФИО выдавшего наряд"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Наряд получил (ФИО)</IonLabel>
                                            <IonInput
                                                value={formData.order.orderReceiver.name}
                                                onIonInput={(e) => handleOrderSignatureChange('orderReceiver', 'name', e.detail.value!)}
                                                placeholder="ФИО получившего наряд"
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonAccordion>

                    {/* ВЫПОЛНЕНИЕ РАБОТ */}
                    <IonAccordion value="execution">
                        <IonItem slot="header">
                            <IonIcon icon={checkmarkCircleOutline} slot="start" />
                            <IonLabel>
                                <h2>Выполнение работ</h2>
                                <p>Информация о выполнении отключения</p>
                            </IonLabel>
                        </IonItem>
                        <IonCardContent slot="content">
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Исполнитель</IonLabel>
                                            <IonInput
                                                value={formData.execution.executor}
                                                onIonInput={(e) => handleExecutionChange('executor', e.detail.value!)}
                                                placeholder="ФИО исполнителя"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="6" sizeMd="3">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Дата выполнения</IonLabel>
                                            <IonDatetime
                                                value={formData.execution.executionDate}
                                                onIonChange={(e) => handleExecutionChange('executionDate', e.detail.value as string)}
                                                presentation="date"
                                                locale="ru-RU"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="6" sizeMd="3">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Время</IonLabel>
                                            <IonDatetime
                                                value={formData.execution.executionTime}
                                                onIonChange={(e) => handleExecutionChange('executionTime', e.detail.value as string)}
                                                presentation="time"
                                                locale="ru-RU"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Отключенное оборудование</IonLabel>
                                            <IonTextarea
                                                value={formData.execution.disconnectedEquipment}
                                                onIonInput={(e) => handleExecutionChange('disconnectedEquipment', e.detail.value!)}
                                                placeholder="Указать наименование, количество приборов, способ отключения"
                                                rows={3}
                                                autoGrow
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonAccordion>

                    {/* ПОДКЛЮЧЕНИЕ ОБРАТНО */}
                    <IonAccordion value="reconnection">
                        <IonItem slot="header">
                            <IonIcon icon={refreshCircleOutline} slot="start" />
                            <IonLabel>
                                <h2>Подключение обратно</h2>
                                <p>Информация о подключении оборудования</p>
                            </IonLabel>
                        </IonItem>
                        <IonCardContent slot="content">
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Дата подключения</IonLabel>
                                            <IonDatetime
                                                value={formData.reconnection.reconnectionDate}
                                                onIonChange={(e) => handleReconnectionChange('reconnectionDate', e.detail.value as string)}
                                                presentation="date"
                                                locale="ru-RU"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">Подключил (ФИО)</IonLabel>
                                            <IonInput
                                                value={formData.reconnection.reconnectionBy}
                                                onIonInput={(e) => handleReconnectionChange('reconnectionBy', e.detail.value!)}
                                                placeholder="ФИО представителя"
                                            />
                                        </IonItem>
                                    </IonCol>
                                    <IonCol size="12">
                                        <IonItem lines="none">
                                            <IonLabel position="stacked">По указанию</IonLabel>
                                            <IonInput
                                                value={formData.reconnection.reconnectionOrder}
                                                onIonInput={(e) => handleReconnectionChange('reconnectionOrder', e.detail.value!)}
                                                placeholder="Должность, ФИО"
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonAccordion>
                </IonAccordionGroup>

                {/* PDF ГЕНЕРАТОР */}
                {showPDFActions && (
                    <IonCard className="pdf-generator-section">
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonIcon icon={documentTextOutline} />
                                Генерация документа
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <PDFGeneratorComponent
                                data={convertToPDFData()}
                                filename={`act-order-${formData.actNumber || 'draft'}.pdf`}
                                showPreview={true}
                                disabled={!formData.actNumber || !formData.representative.name}
                            />
                        </IonCardContent>
                    </IonCard>
                )}

                {/* ДЕЙСТВИЯ */}
                {!isModal && (
                    <div className="form-actions no-print">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12" sizeMd="6">
                                    <IonButton
                                        expand="block"
                                        fill="outline"
                                        onClick={handleSaveDraft}
                                    >
                                        <IonIcon icon={saveOutline} slot="start" />
                                        Сохранить черновик
                                    </IonButton>
                                </IonCol>
                                <IonCol size="12" sizeMd="6">
                                    <IonButton
                                        expand="block"
                                        onClick={handleAutoFill}
                                        color="secondary"
                                    >
                                        <IonIcon icon={refreshCircleOutline} slot="start" />
                                        Автозаполнение
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                )}
            </div>

            {/* УВЕДОМЛЕНИЕ О СОХРАНЕНИИ */}
            <IonToast
                isOpen={showSaveToast}
                onDidDismiss={() => setShowSaveToast(false)}
                message="Черновик сохранен"
                duration={2000}
                icon={checkmarkCircleOutline}
                color="success"
                position="top"
            />
        </div>
    );
};

export default ActOrderForm;