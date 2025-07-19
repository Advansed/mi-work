// ============================================
// ШАБЛОН АКТ-НАРЯДА НА ОТКЛЮЧЕНИЕ ГАЗОВОГО ОБОРУДОВАНИЯ
// ============================================

import { BaseTemplate } from './BaseTemplate';
import { ActOrderData } from '../types';
import { TextUtils } from '../utils/textUtils';
import { CORPORATE_SETTINGS } from '../config';

export class ActOrderTemplate extends BaseTemplate {
    /**
     * Основной метод рендеринга документа
     */
    public renderDocument(data: ActOrderData): void {
        this.renderHeader();
        this.renderTitle(data.actNumber, data.date);
        this.renderRepresentativeSection(data.representative);
        this.renderOrderSection(data.order);
        this.renderExecutionSection(data.execution);
        this.renderReconnectionSection(data.reconnection);
        this.renderFooter();
    }

    /**
     * Рендерит заголовок с логотипом компании
     */
    private renderHeader(): void {
        // Логотип компании (можно заменить на реальное изображение)
        this.doc.setFillColor(this.config.colors.secondary);
        this.doc.circle(this.config.margins.left + 15, this.currentY + 15, 12, 'F');
        
        // Иконка здания в логотипе
        this.doc.setTextColor('#FFFFFF');
        this.doc.setFontSize(16);
        this.doc.text('🏢', this.config.margins.left + 11, this.currentY + 19);

        // Название компании
        this.setTitleStyle();
        this.doc.setTextColor(this.config.colors.primary);
        this.doc.text(CORPORATE_SETTINGS.companyName, this.config.margins.left + 35, this.currentY + 12);
        
        // Подразделение
        this.doc.setFontSize(14);
        this.doc.text(CORPORATE_SETTINGS.department, this.config.margins.left + 35, this.currentY + 20);

        // Линия под заголовком
        this.currentY += 35;
        this.addLine(
            this.config.margins.left, 
            this.currentY, 
            this.pageWidth - this.config.margins.right, 
            this.currentY,
            this.config.colors.primary
        );
        
        this.addSpacing(10);
        this.resetTextStyle();
    }

    /**
     * Рендерит заголовок документа
     */
    private renderTitle(actNumber: string, date: string): void {
        // Основной заголовок
        this.setTitleStyle();
        
        // АКТ-НАРЯД №
        const titleY = this.currentY;
        this.doc.text('АКТ-НАРЯД №', this.config.margins.left + 60, titleY);
        
        // Поле для номера
        this.addInputField(
            this.config.margins.left + 110, 
            titleY - 3, 
            30, 
            actNumber
        );

        this.addSpacing(8);

        // Подзаголовок
        this.addText(
            CORPORATE_SETTINGS.documentSubtitle, 
            0, 
            undefined, 
            { 
                align: 'center', 
                fontSize: 14, 
                fontStyle: 'bold'
            }
        );

        this.addSpacing(8);

        // Дата
        const dateText = `«`;
        const dateY = this.currentY;
        
        this.resetTextStyle();
        this.doc.text(dateText, this.config.margins.left + 60, dateY);
        
        // Извлекаем день из даты
        let day = '';
        if (date) {
            const dateObj = new Date(date);
            day = dateObj.getDate().toString();
        }
        
        this.addInputField(this.config.margins.left + 70, dateY - 3, 15, day);
        this.doc.text('»', this.config.margins.left + 90, dateY);
        
        // Месяц
        let month = '';
        if (date) {
            const dateObj = new Date(date);
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            month = months[dateObj.getMonth()];
        }
        
        this.addInputField(this.config.margins.left + 95, dateY - 3, 40, month);
        
        // Год
        let year = '';
        if (date) {
            const dateObj = new Date(date);
            year = dateObj.getFullYear().toString().slice(-2);
        }
        
        this.addInputField(this.config.margins.left + 140, dateY - 3, 15, year);
        this.doc.text('г.', this.config.margins.left + 160, dateY);

        this.addSpacing();
    }

    /**
     * Рендерит секцию представителя
     */
    private renderRepresentativeSection(representative: any): void {
        const startY = this.currentY;
        
        // Представителю эксплуатационной организации
        this.doc.text('Представителю эксплуатационной организации', this.config.margins.left, startY);
        this.addInputField(this.config.margins.left + 110, startY - 3, 80, representative.name);
        
        this.addSpacing(5);
        
        // Подпись под полем
        this.doc.setFontSize(10);
        this.doc.setTextColor('#666666');
        this.doc.text('ф.и.о., должность', this.config.margins.left + 120, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing(8);
        
        // ввиду
        this.doc.text('ввиду', this.config.margins.left, this.currentY);
        this.addTextArea(this.config.margins.left + 20, this.currentY - 5, 150, 20, representative.reason);
        
        this.addSpacing(25);
        
        // поручается отключить
        this.doc.text('поручается отключить', this.config.margins.left, this.currentY);
        this.addInputField(this.config.margins.left + 60, this.currentY - 3, 120, representative.equipment || '');
        
        this.addSpacing(5);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#666666');
        this.doc.text('наименование приборов', this.config.margins.left + 100, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing();
    }

    /**
     * Рендерит секцию наряда
     */
    private renderOrderSection(order: any): void {
        // в квартире № ... дома ... по ул.
        const apartmentY = this.currentY;
        this.doc.text('в квартире №', this.config.margins.left, apartmentY);
        this.addInputField(this.config.margins.left + 30, apartmentY - 3, 20, order.apartment);
        
        this.doc.text('дома', this.config.margins.left + 55, apartmentY);
        this.addInputField(this.config.margins.left + 75, apartmentY - 3, 20, order.house);
        
        this.doc.text('по ул.', this.config.margins.left + 100, apartmentY);
        this.addInputField(this.config.margins.left + 115, apartmentY - 3, 70, order.street);
        
        this.addSpacing(8);
        
        // у абонента
        this.doc.text('у абонента', this.config.margins.left, this.currentY);
        this.addInputField(this.config.margins.left + 30, this.currentY - 3, 120, order.subscriber);
        
        this.addSpacing(5);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#666666');
        this.doc.text('ф.и.о.', this.config.margins.left + 80, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing(15);
        
        // Наряд выдал / получил
        const orderY = this.currentY;
        this.doc.text('Наряд выдал', this.config.margins.left, orderY);
        this.addInputField(this.config.margins.left + 35, orderY - 3, 60, order.orderGiver?.name);
        
        this.doc.text('Наряд получил', this.config.margins.left + 105, orderY);
        this.addInputField(this.config.margins.left + 150, orderY - 3, 60, order.orderReceiver?.name);
        
        this.addSpacing(5);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#666666');
        this.doc.text('должность, ф.и.о., подпись', this.config.margins.left + 40, this.currentY);
        this.doc.text('должность, ф.и.о., подпись', this.config.margins.left + 155, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing();
    }

    /**
     * Рендерит секцию выполнения
     */
    private renderExecutionSection(execution: any): void {
        // Фон для секции выполнения
        this.doc.setFillColor('#f9f9f9');
        this.doc.rect(this.config.margins.left - 5, this.currentY - 5, this.contentWidth + 10, 60, 'F');
        
        // Мною
        this.doc.text('Мною', this.config.margins.left, this.currentY);
        this.addInputField(this.config.margins.left + 20, this.currentY - 3, 120, execution.executor);
        
        this.addSpacing(5);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#666666');
        this.doc.text('должность, ф.и.о.', this.config.margins.left + 60, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing(8);
        
        // Дата и время выполнения
        const execY = this.currentY;
        this.doc.text('«', this.config.margins.left, execY);
        
        let execDay = '';
        if (execution.executionDate) {
            const dateObj = new Date(execution.executionDate);
            execDay = dateObj.getDate().toString();
        }
        
        this.addInputField(this.config.margins.left + 8, execY - 3, 15, execDay);
        this.doc.text('»', this.config.margins.left + 28, execY);
        this.addInputField(this.config.margins.left + 35, execY - 3, 30, '');
        this.doc.text('20', this.config.margins.left + 70, execY);
        this.addInputField(this.config.margins.left + 80, execY - 3, 15, '');
        this.doc.text('г. в', this.config.margins.left + 100, execY);
        
        // Время
        const time = TextUtils.formatTime(execution.executionTime);
        this.addInputField(this.config.margins.left + 115, execY - 3, 15, time.hours);
        this.doc.text('ч.', this.config.margins.left + 135, execY);
        this.addInputField(this.config.margins.left + 145, execY - 3, 15, time.minutes);
        this.doc.text('мин.', this.config.margins.left + 165, execY);
        
        this.addSpacing(8);
        
        // произведено отключение
        this.doc.text('произведено отключение газоиспользующего оборудования', this.config.margins.left, this.currentY);
        this.addSpacing(5);
        this.addTextArea(this.config.margins.left, this.currentY, this.contentWidth, 15, execution.disconnectedEquipment);
        
        this.addSpacing(20);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#666666');
        this.doc.text('указать наименование, количество приборов, способ отключения', this.config.margins.left + 30, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing(8);
        
        // Подписи
        this.setBoldStyle();
        this.doc.text('Подписи:', this.config.margins.left, this.currentY);
        this.resetTextStyle();
        this.addSpacing(5);
        
        this.addSignatureSection([
            execution.representativeSignature || { name: '', position: 'Представитель эксплуатационной организации' },
            execution.subscriberSignature || { name: '', position: 'Ответственный квартиросъёмщик (абонент)' }
        ]);
    }

    /**
     * Рендерит секцию подключения
     */
    private renderReconnectionSection(reconnection: any): void {
        this.addSpacing(10);
        
        // Фон для секции подключения
        this.doc.setFillColor('#f0f8ff');
        this.doc.rect(this.config.margins.left - 5, this.currentY - 5, this.contentWidth + 10, 50, 'F');
        
        // Газоиспользующее оборудование подключено
        const reconnY = this.currentY;
        this.doc.text('Газоиспользующее оборудование подключено «', this.config.margins.left, reconnY);
        
        let reconnDay = '';
        if (reconnection.reconnectionDate) {
            const dateObj = new Date(reconnection.reconnectionDate);
            reconnDay = dateObj.getDate().toString();
        }
        
        this.addInputField(this.config.margins.left + 95, reconnY - 3, 15, reconnDay);
        this.doc.text('»', this.config.margins.left + 115, reconnY);
        this.addInputField(this.config.margins.left + 120, reconnY - 3, 30, '');
        this.doc.text('20', this.config.margins.left + 155, reconnY);
        this.addInputField(this.config.margins.left + 165, reconnY - 3, 15, '');
        this.doc.text('г.', this.config.margins.left + 185, reconnY);
        
        this.addSpacing(8);
        
        // представителем эксплуатационной организации
        this.doc.text('представителем эксплуатационной организации', this.config.margins.left, this.currentY);
        this.addInputField(this.config.margins.left + 90, this.currentY - 3, 90, reconnection.reconnectionBy);
        
        this.addSpacing(8);
        
        // по указанию
        this.doc.text('по указанию', this.config.margins.left, this.currentY);
        this.addInputField(this.config.margins.left + 30, this.currentY - 3, 120, reconnection.reconnectionOrder);
        
        this.addSpacing(8);
        
        // адрес и абонент
        this.doc.text(`в квартире №________ дома________ по ул.__________________________________________`, this.config.margins.left, this.currentY);
        this.addSpacing(5);
        this.doc.text(`у абонента ______________________________________________________________________`, this.config.margins.left, this.currentY);
        
        this.addSpacing(8);
        
        // Подписи для подключения
        this.setBoldStyle();
        this.doc.text('Подписи:', this.config.margins.left, this.currentY);
        this.resetTextStyle();
        this.addSpacing(5);
        
        this.addSignatureSection([
            reconnection.representativeSignature || { name: '', position: 'Представитель эксплуатационной организации' },
            reconnection.subscriberSignature || { name: '', position: 'Ответственный квартиросъёмщик (абонент)' }
        ]);
    }

    /**
     * Рендерит футер документа
     */
    private renderFooter(): void {
        this.addSpacing(15);
        
        // Примечание
        this.setBoldStyle();
        this.doc.text('Примечание:', this.config.margins.left, this.currentY);
        this.resetTextStyle();
        
        this.addSpacing(3);
        
        const noteText = 'Акт-наряд составляется в двух экземплярах, один из которых выдаётся на руки абоненту, другой хранится в эксплуатационной организации.';
        this.addText(
            noteText, 
            this.config.margins.left, 
            undefined, 
            { 
                maxWidth: this.contentWidth, 
                fontSize: 10 
            }
        );
    }
}