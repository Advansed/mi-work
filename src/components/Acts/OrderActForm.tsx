import React, { useState } from 'react';
import './OrderActForm.css'

const ActOrderForm: React.FC = () => {
    const [formData, setFormData] = useState({
        actNumber:              '',
        date:                   '',
        representative:         '',
        position:               '',
        reason:                 '',
        equipment:              '',
        apartment:              '',
        house:                  '',
        street:                 '',
        subscriber:             '',
        orderGiver:             '',
        orderReceiver:          '',
        executor:               '',
        executionDate:          '',
        executionTime:          '',
        disconnectedEquipment:  '',
        reconnectionDate:       '',
        reconnectionBy:         '',
        reconnectionOrder:      ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="act-order-page">
            <div className="page-header no-print">
                <h1>АКТ-НАРЯД на отключение газового оборудования</h1>
                <button 
                    className="print-btn"
                    onClick={handlePrint}
                >
                    🖨️ Печать
                </button>
            </div>
            
            <div className="form-container">
                <div className="print-form">
                    {/* Заголовок организации */}
                    <div className="form-header">
                        <div className="company-logo">
                            <div className="logo-icon">🏢</div>
                            <div className="company-info">
                                <h2>САХАТРАНСНЕФТЕГАЗ</h2>
                                <p>УСД</p>
                            </div>
                        </div>
                    </div>

                    {/* Заголовок документа */}
                    <div className="document-header">
                        <h1>
                            АКТ-НАРЯД №
                            <input
                                type="text"
                                value={formData.actNumber}
                                onChange={(e) => handleInputChange('actNumber', e.target.value)}
                                placeholder="________"
                                className="inline-input"
                            />
                        </h1>
                        <h2>НА ОТКЛЮЧЕНИЕ ГАЗОИСПОЛЬЗУЮЩЕГО<br/>ОБОРУДОВАНИЯ ЖИЛЫХ ЗДАНИЙ</h2>
                        
                        <div className="date-line">
                            «<input
                                type="text"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                placeholder="___"
                                className="inline-input small"
                            />» _________________ 20___г.
                        </div>
                    </div>

                    {/* Основное содержание */}
                    <div className="form-content">
                        <div className="content-section">
                            <p>Представителю эксплуатационной организации 
                                <input
                                    type="text"
                                    value={formData.representative}
                                    onChange={(e) => handleInputChange('representative', e.target.value)}
                                    placeholder="_______________________________________"
                                    className="underlined-input"
                                />
                            </p>
                            <p className="small-text">ф.и.о., должность</p>
                        </div>

                        <div className="content-section">
                            <p>ввиду</p>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                placeholder="указать причину"
                                className="underlined-textarea"
                                rows={2}
                            />
                        </div>

                        <div className="content-section">
                            <p>поручается отключить 
                                <input
                                    type="text"
                                    value={formData.equipment}
                                    onChange={(e) => handleInputChange('equipment', e.target.value)}
                                    placeholder="наименование приборов"
                                    className="underlined-input"
                                />
                            </p>
                        </div>

                        <div className="content-section">
                            <p>в квартире №
                                <input
                                    type="text"
                                    value={formData.apartment}
                                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                                    placeholder="____"
                                    className="inline-input small"
                                /> дома
                                <input
                                    type="text"
                                    value={formData.house}
                                    onChange={(e) => handleInputChange('house', e.target.value)}
                                    placeholder="____"
                                    className="inline-input small"
                                /> по ул.
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                    placeholder="__________________________________________"
                                    className="underlined-input"
                                />
                            </p>
                        </div>

                        <div className="content-section">
                            <p>у абонента 
                                <input
                                    type="text"
                                    value={formData.subscriber}
                                    onChange={(e) => handleInputChange('subscriber', e.target.value)}
                                    placeholder="ф.и.о."
                                    className="underlined-input"
                                />
                            </p>
                        </div>

                        <div className="two-column">
                            <div className="column">
                                <p>Наряд выдал</p>
                                <input
                                    type="text"
                                    value={formData.orderGiver}
                                    onChange={(e) => handleInputChange('orderGiver', e.target.value)}
                                    placeholder="должность, ф.и.о., подпись"
                                    className="underlined-input"
                                />
                            </div>
                            <div className="column">
                                <p>Наряд получил</p>
                                <input
                                    type="text"
                                    value={formData.orderReceiver}
                                    onChange={(e) => handleInputChange('orderReceiver', e.target.value)}
                                    placeholder="должность, ф.и.о., подпись"
                                    className="underlined-input"
                                />
                            </div>
                        </div>

                        {/* Раздел выполнения */}
                        <div className="execution-section">
                            <div className="content-section">
                                <p>Мною 
                                    <input
                                        type="text"
                                        value={formData.executor}
                                        onChange={(e) => handleInputChange('executor', e.target.value)}
                                        placeholder="должность, ф.и.о."
                                        className="underlined-input"
                                    />
                                </p>
                            </div>
                            
                            <div className="content-section">
                                <p>«<input
                                    type="text"
                                    value={formData.executionDate}
                                    onChange={(e) => handleInputChange('executionDate', e.target.value)}
                                    placeholder="___"
                                    className="inline-input small"
                                />» _____________ 20___г. в 
                                <input
                                    type="text"
                                    value={formData.executionTime}
                                    onChange={(e) => handleInputChange('executionTime', e.target.value)}
                                    placeholder="__:__"
                                    className="inline-input small"
                                /> ч. ______ мин.</p>
                            </div>

                            <div className="content-section">
                                <p>произведено отключение газоиспользующего оборудования</p>
                                <textarea
                                    value={formData.disconnectedEquipment}
                                    onChange={(e) => handleInputChange('disconnectedEquipment', e.target.value)}
                                    placeholder="указать наименование, количество приборов, способ отключения"
                                    className="underlined-textarea"
                                    rows={2}
                                />
                                <p className="small-text">указать наименование, количество приборов, способ отключения</p>
                            </div>

                            <div className="content-section">
                                <p>в квартире №______ дома _______ по ул. ____________________________________________</p>
                            </div>
                        </div>

                        {/* Подписи */}
                        <div className="signatures-section">
                            <p><strong>Подписи:</strong></p>
                            <p>Представитель эксплуатационной организации ________________________</p>
                            <p>Ответственный квартиросъёмщик (абонент) __________________________</p>
                        </div>

                        {/* Раздел подключения */}
                        <div className="reconnection-section">
                            <div className="content-section">
                                <p>Газоиспользующее оборудование подключено «
                                    <input
                                        type="text"
                                        value={formData.reconnectionDate}
                                        onChange={(e) => handleInputChange('reconnectionDate', e.target.value)}
                                        placeholder="___"
                                        className="inline-input small"
                                    />»______________20___г.</p>
                            </div>
                            
                            <div className="content-section">
                                <p>представителем эксплуатационной организации 
                                    <input
                                        type="text"
                                        value={formData.reconnectionBy}
                                        onChange={(e) => handleInputChange('reconnectionBy', e.target.value)}
                                        placeholder="должность, ф.и.о."
                                        className="underlined-input"
                                    />
                                </p>
                            </div>

                            <div className="content-section">
                                <p>по указанию 
                                    <input
                                        type="text"
                                        value={formData.reconnectionOrder}
                                        onChange={(e) => handleInputChange('reconnectionOrder', e.target.value)}
                                        placeholder="должность, ф.и.о."
                                        className="underlined-input"
                                    />
                                </p>
                            </div>

                            <div className="content-section">
                                <p>в квартире №________ дома________ по ул.__________________________________________</p>
                                <p>у абонента ______________________________________________________________________</p>
                                <p className="small-text">ф.и.о.</p>
                            </div>

                            <div className="signatures-section">
                                <p><strong>Подписи:</strong></p>
                                <p>Представитель эксплуатационной организации ________________________</p>
                                <p>Ответственный квартиросъёмщик (абонент) ___________________________</p>
                            </div>
                        </div>

                        {/* Примечание */}
                        <div className="note-section">
                            <p><strong>Примечание:</strong> Акт-наряд составляется в двух экземплярах, один из которых выдаётся на руки абоненту, другой хранится в эксплуатационной организации.</p>
                        </div>
                    </div>

                    {/* Кнопка печати */}
                    <div className="print-button-section no-print">
                        <button 
                            className="print-button"
                            onClick={handlePrint}
                        >
                            🖨️ Печать документа
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ActOrderForm;