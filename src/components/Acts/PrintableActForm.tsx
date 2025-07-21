import React, { useRef } from 'react';
import {
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import {
    printOutline,
    downloadOutline,
    arrowBackOutline
} from 'ionicons/icons';
import './PrintableActForm.css';

interface Service {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    price: number;
    total: number;
}

interface PrintableActFormProps {
    data: {
        actNumber: string;
        date: string;
        customer: {
            name: string;
            address: string;
            apartment: string;
            house: string;
            street: string;
        };
        executor: {
            name: string;
            position: string;
            organization: string;
        };
        services: Service[];
        total: number;
        workPeriod: {
            startDate: string;
            endDate: string;
        };
        quality: string;
        notes?: string;
    };
    onBack?: () => void;
    isModal?: boolean;
}

const PrintableActForm: React.FC<PrintableActFormProps> = ({ 
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
            day: date.getDate().toString().padStart(2, '0'),
            month: months[date.getMonth()] || '',
            year: date.getFullYear().toString()
        };
    };

    // Форматирование числа в валюту
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2
        }).format(amount);
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
    const startDateFormatted = formatDate(data.workPeriod.startDate);
    const endDateFormatted = formatDate(data.workPeriod.endDate);

    return (
        <div className={`printable-act-form ${isModal ? 'printable-act-form-modal' : ''}`}>
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
            <div ref={printRef} className="act-works-form">
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
                    <h1>АКТ ВЫПОЛНЕННЫХ РАБОТ №<span className="field-value">{data.actNumber || '_______'}</span></h1>
                    
                    <div className="date-line">
                        «<span className="field-value small">{dateFormatted.day || '___'}</span>»
                        <span className="field-value medium">{dateFormatted.month || '_______________'}</span>
                        <span className="field-value small">{dateFormatted.year || '____'}</span>г.
                    </div>
                </div>

                {/* Стороны договора */}
                <div className="parties-section">
                    <div className="party-block">
                        <div className="party-title">ИСПОЛНИТЕЛЬ:</div>
                        <div className="party-info">
                            <div><strong>{data.executor.organization || 'ООО "СахаТрансНефтеГаз"'}</strong></div>
                            <div>в лице {data.executor.position || 'слесаря'} {data.executor.name || '________________________'}</div>
                        </div>
                    </div>

                    <div className="party-block">
                        <div className="party-title">ЗАКАЗЧИК:</div>
                        <div className="party-info">
                            <div><strong>{data.customer.name || '________________________________________________'}</strong></div>
                            <div>проживающий по адресу: {data.customer.address || '_________________________________'}</div>
                            <div>
                                ул. <span className="field-value medium">{data.customer.street || '____________________'}</span>,
                                д. <span className="field-value small">{data.customer.house || '____'}</span>,
                                кв. <span className="field-value small">{data.customer.apartment || '____'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Период выполнения работ */}
                <div className="work-period">
                    <div className="content-line">
                        Настоящий акт составлен в том, что в период с 
                        «<span className="field-value small">{startDateFormatted.day || '___'}</span>»
                        <span className="field-value medium">{startDateFormatted.month || '_______________'}</span>
                        <span className="field-value small">{startDateFormatted.year || '____'}</span>г.
                        по 
                        «<span className="field-value small">{endDateFormatted.day || '___'}</span>»
                        <span className="field-value medium">{endDateFormatted.month || '_______________'}</span>
                        <span className="field-value small">{endDateFormatted.year || '____'}</span>г.
                        ИСПОЛНИТЕЛЕМ выполнены следующие работы:
                    </div>
                </div>

                {/* Таблица выполненных работ */}
                <div className="services-table">
                    <table>
                        <thead>
                            <tr>
                                <th className="col-num">№ п/п</th>
                                <th className="col-service">Наименование работ (услуг)</th>
                                <th className="col-unit">Ед. изм.</th>
                                <th className="col-qty">Кол-во</th>
                                <th className="col-price">Цена, руб.</th>
                                <th className="col-total">Сумма, руб.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.services.map((service, index) => (
                                <tr key={service.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>{service.name}</td>
                                    <td className="text-center">{service.unit}</td>
                                    <td className="text-center">{service.quantity}</td>
                                    <td className="text-right">{service.price.toFixed(2)}</td>
                                    <td className="text-right">{service.total.toFixed(2)}</td>
                                </tr>
                            ))}
                            
                            {/* Пустые строки для ручного заполнения */}
                            {Array.from({ length: Math.max(0, 5 - data.services.length) }, (_, index) => (
                                <tr key={`empty-${index}`} className="empty-row">
                                    <td>{data.services.length + index + 1}</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="total-row">
                                <td colSpan={5} className="text-right"><strong>ИТОГО:</strong></td>
                                <td className="text-right"><strong>{data.total.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Сумма прописью */}
                <div className="amount-words">
                    <div className="content-line">
                        Всего выполнено работ на сумму: <span className="field-value extra-long">{formatCurrency(data.total)}</span>
                    </div>
                    <div className="content-line">
                        <span className="field-value full-width">_____________________________________________________________________________</span>
                    </div>
                    <div className="field-description">(сумма прописью)</div>
                </div>

                {/* Качество работ */}
                <div className="quality-section">
                    <div className="content-line">
                        Работы выполнены полностью, в установленные сроки, с надлежащим качеством.
                    </div>
                    <div className="content-line">
                        Качество выполненных работ: <span className="field-value long">{data.quality || 'отличное'}</span>
                    </div>
                    <div className="content-line">
                        Претензий к выполненным работам не имею.
                    </div>
                </div>

                {/* Примечания */}
                {data.notes && (
                    <div className="notes-section">
                        <div className="content-line">
                            <strong>Примечания:</strong> {data.notes}
                        </div>
                    </div>
                )}

                {/* Подписи */}
                <div className="signatures-section">
                    <div className="signatures-grid">
                        <div className="signature-block">
                            <div className="signature-title">ИСПОЛНИТЕЛЬ:</div>
                            <div className="signature-line">
                                <span className="field-value signature">_____________________</span>
                                <span className="field-value signature">{data.executor.name || '_____________________'}</span>
                            </div>
                            <div className="field-description">подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; расшифровка подписи</div>
                            
                            <div className="date-signature">
                                «<span className="field-value small">___</span>»
                                <span className="field-value medium">___________</span>
                                20<span className="field-value small">___</span>г.
                            </div>
                        </div>

                        <div className="signature-block">
                            <div className="signature-title">ЗАКАЗЧИК:</div>
                            <div className="signature-line">
                                <span className="field-value signature">_____________________</span>
                                <span className="field-value signature">{data.customer.name || '_____________________'}</span>
                            </div>
                            <div className="field-description">подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; расшифровка подписи</div>
                            
                            <div className="date-signature">
                                «<span className="field-value small">___</span>»
                                <span className="field-value medium">___________</span>
                                20<span className="field-value small">___</span>г.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Печать */}
                <div className="stamp-section">
                    <div className="stamp-placeholder">
                        М.П.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableActForm;