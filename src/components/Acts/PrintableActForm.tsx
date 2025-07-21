import React, { useRef } from 'react';
import {
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import {
    printOutline,
    downloadOutline,
    arrowBackOutline
} from 'ionicons/icons';
import './PrintableActOrder.css';

interface PrintableActOrderProps {
    data: {
        actNumber: string;
        date: string;
        representative: {
            name: string;
            position: string;
            reason: string;
        };
        order: {
            equipment: string;
            apartment: string;
            house: string;
            street: string;
            subscriber: string;
            orderGiver: {
                name: string;
                position: string;
            };
            orderReceiver: {
                name: string;
                position: string;
            };
        };
        execution: {
            executor: string;
            executionDate: string;
            executionTime: string;
            disconnectedEquipment: string;
        };
        reconnection: {
            reconnectionDate: string;
            reconnectionBy: string;
            reconnectionOrder: string;
            subscriber: string;
        };
    };
    onBack?: () => void;
    isModal?: boolean;
}

const PrintableActOrder: React.FC<PrintableActOrderProps> = ({ 
    data, 
    onBack, 
    isModal = false 
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    // Форматирование даты
    const formatDate = (dateString: string) => {
        if (!dateString) return { day: '', month: '', year: '' };
        
        const date = new Date(dateString);
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        
        return {
            day: date.getDate().toString(),
            month: months[date.getMonth()] || '',
            year: date.getFullYear().toString().slice(-2)
        };
    };

    // Форматирование времени
    const formatTime = (timeString: string) => {
        if (!timeString) return { hours: '', minutes: '' };
        
        const time = new Date(timeString);
        return {
            hours: time.getHours().toString().padStart(2, '0'),
            minutes: time.getMinutes().toString().padStart(2, '0')
        };
    };

    // Печать документа
    const handlePrint = () => {
        window.print();
    };

    // Сохранение как PDF
    const handleSaveAsPDF = () => {
        window.print();
    };

    const dateFormatted = formatDate(data.date);
    const executionDateFormatted = formatDate(data.execution.executionDate);
    const reconnectionDateFormatted = formatDate(data.reconnection.reconnectionDate);
    const timeFormatted = formatTime(data.execution.executionTime);

    return (
        <div className={`printable-act ${isModal ? 'printable-act-modal' : ''}`}>
            {/* Кнопки управления - скрываются при печати */}
            {isModal && (
                <div className="print-controls no-print">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="4">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={onBack}
                                >
                                    <IonIcon icon={arrowBackOutline} slot="start" />
                                    Назад
                                </IonButton>
                            </IonCol>
                            <IonCol size="4">
                                <IonButton
                                    expand="block"
                                    onClick={handlePrint}
                                    color="primary"
                                >
                                    <IonIcon icon={printOutline} slot="start" />
                                    Печать
                                </IonButton>
                            </IonCol>
                            <IonCol size="4">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={handleSaveAsPDF}
                                    color="secondary"
                                >
                                    <IonIcon icon={downloadOutline} slot="start" />
                                    Сохранить PDF
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            )}

            {/* Печатная форма */}
            <div ref={printRef} className="act-form">
                {/* Шапка с логотипом */}
                <div className="act-header">
                    <div className="company-logo">
                        <div className="logo-circle">
                            <span className="logo-text">СТНГ</span>
                        </div>
                        <div className="company-info">
                            <div className="company-name">САХАТРАНСНЕФТЕГАЗ</div>
                            <div className="department">УСД</div>
                        </div>
                    </div>
                </div>

                {/* Заголовок документа */}
                <div className="document-title">
                    <h1>
                        АКТ-НАРЯД №<span className="field-value">{data.actNumber || '_______'}</span>
                    </h1>
                    <h2>НА ОТКЛЮЧЕНИЕ ГАЗОИСПОЛЬЗУЮЩЕГО<br />ОБОРУДОВАНИЯ ЖИЛЫХ ЗДАНИЙ</h2>
                    
                    <div className="date-line">
                        «<span className="field-value small">{dateFormatted.day || '_____'}</span>»
                        <span className="field-value medium">{dateFormatted.month || '__________________'}</span>
                        20<span className="field-value small">{dateFormatted.year || '___'}</span>г.
                    </div>
                </div>

                {/* Основное содержание */}
                <div className="act-content">
                    {/* Представитель организации */}
                    <div className="content-line">
                        Представителю эксплуатационной организации 
                        <span className="field-value long">{data.representative.name || '_______________________________________'}</span>
                    </div>
                    <div className="field-description">ф.и.о., должность</div>

                    <div className="content-line">
                        ввиду <span className="field-value extra-long">{data.representative.reason || '__________________________________________________________________________'}</span>
                    </div>
                    <div className="field-description">указать причину</div>

                    <div className="content-line spacing-top">
                        поручается отключить 
                        <span className="field-value long">{data.order.equipment || '____________________________________________________________'}</span>
                    </div>
                    <div className="field-description">наименование приборов</div>

                    {/* Адрес */}
                    <div className="content-line">
                        в квартире №<span className="field-value small">{data.order.apartment || '________'}</span>
                        дома<span className="field-value small">{data.order.house || '________'}</span>
                        по ул.<span className="field-value medium">{data.order.street || '__________________________________________'}</span>
                    </div>

                    <div className="content-line">
                        у абонента 
                        <span className="field-value extra-long">{data.order.subscriber || '______________________________________________________________________'}</span>
                    </div>
                    <div className="field-description">ф.и.о.</div>

                    {/* Подписи выдачи наряда */}
                    <div className="signatures-section">
                        <div className="signature-line">
                            Наряд выдал 
                            <span className="field-value signature">{data.order.orderGiver.name || '__________________________________'}</span>
                            <span className="field-value signature">{' __________________________________'}</span>
                        </div>
                        <div className="field-description">должность, ф.и.о., подпись</div>

                        <div className="signature-line">
                            Наряд получил 
                            <span className="field-value signature">{data.order.orderReceiver.name || '__________________________________'}</span>
                            <span className="field-value signature">{' __________________________________'}</span>
                        </div>
                        <div className="field-description">должность, ф.и.о., подпись</div>
                    </div>

                    {/* Выполнение работ */}
                    <div className="execution-section">
                        <div className="content-line">
                            Мною 
                            <span className="field-value extra-long">{data.execution.executor || '__________________________________________________________________________'}</span>
                        </div>
                        <div className="field-description">должность, ф.и.о.</div>

                        <div className="content-line">
                            «<span className="field-value small">{executionDateFormatted.day || '_____'}</span>»
                            <span className="field-value medium">{executionDateFormatted.month || '_______________'}</span>
                            20<span className="field-value small">{executionDateFormatted.year || '___'}</span>г. в 
                            <span className="field-value small">{timeFormatted.hours || '_____'}</span>ч.
                            <span className="field-value small">{timeFormatted.minutes || '______'}</span>мин.
                        </div>

                        <div className="content-line">
                            произведено отключение газоиспользующего оборудования 
                            <span className="field-value long">{data.execution.disconnectedEquipment || '___________________________'}</span>
                        </div>

                        <div className="field-description">указать наименование, количество приборов, способ отключения</div>

                        <div className="content-line">
                            в квартире №<span className="field-value small">{data.order.apartment || '______'}</span>
                            дома <span className="field-value small">{data.order.house || '_______'}</span>
                            по ул. <span className="field-value medium">{data.order.street || '____________________________________________'}</span>
                        </div>

                        {/* Подписи выполнения */}
                        <div className="signatures-execution">
                            <div className="signatures-title">Подписи:</div>
                            <div className="signature-line">
                                Представитель эксплуатационной организации 
                                <span className="field-value signature">________________________</span>
                            </div>
                            <div className="signature-line">
                                Ответственный квартиросъёмщик (абонент) 
                                <span className="field-value signature">__________________________</span>
                            </div>
                        </div>
                    </div>

                    {/* Подключение обратно */}
                    <div className="reconnection-section">
                        <div className="content-line">
                            Газоиспользующее оборудование подключено 
                            «<span className="field-value small">{reconnectionDateFormatted.day || '_____'}</span>»
                            <span className="field-value medium">{reconnectionDateFormatted.month || '______________'}</span>
                            20<span className="field-value small">{reconnectionDateFormatted.year || '___'}</span>г.
                        </div>

                        <div className="content-line">
                            представителем эксплуатационной организации 
                            <span className="field-value long">{data.reconnection.reconnectionBy || '______________________________________'}</span>
                        </div>
                        <div className="field-description">должность, ф.и.о.</div>

                        <div className="content-line">
                            по указанию 
                            <span className="field-value extra-long">{data.reconnection.reconnectionOrder || '_____________________________________________________________________'}</span>
                        </div>
                        <div className="field-description">должность, ф.и.о.</div>

                        <div className="content-line">
                            в квартире №<span className="field-value small">{data.order.apartment || '________'}</span>
                            дома<span className="field-value small">{data.order.house || '________'}</span>
                            по ул.<span className="field-value medium">{data.order.street || '__________________________________________'}</span>
                        </div>

                        <div className="content-line">
                            у абонента 
                            <span className="field-value extra-long">{data.reconnection.subscriber || '______________________________________________________________________'}</span>
                        </div>
                        <div className="field-description">ф.и.о.</div>

                        {/* Подписи подключения */}
                        <div className="signatures-reconnection">
                            <div className="signatures-title">Подписи:</div>
                            <div className="signature-line">
                                Представитель эксплуатационной организации 
                                <span className="field-value signature">________________________</span>
                            </div>
                            <div className="signature-line">
                                Ответственный квартиросъёмщик (абонент) 
                                <span className="field-value signature">___________________________</span>
                            </div>
                        </div>
                    </div>

                    {/* Примечание */}
                    <div className="note-section">
                        <strong>Примечание:</strong> Акт-наряд составляется в двух экземплярах, один из которых выдаётся на руки абоненту, другой хранится в эксплуатационной организации.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableActOrder;