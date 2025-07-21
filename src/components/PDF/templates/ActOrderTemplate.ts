// ============================================
// ИСПРАВЛЕННЫЙ ШАБЛОН АКТ-НАРЯДА
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
        try {
            this.renderHeader();
            this.renderTitle(data.actNumber, data.date);
            this.renderRepresentativeSection(data.representative);
            this.renderOrderSection(data.order);
            this.renderExecutionSection(data.execution);
            this.renderReconnectionSection(data.reconnection);
            this.renderFooter();
        } catch (error) {
            console.error('Ошибка рендеринга документа:', error);
            // Добавляем базовую информацию при ошибке
            this.doc.text('Ошибка генерации документа', 20, 50);
            this.doc.text(`АКТ-НАРЯД № ${data.actNumber || 'Не указан'}`, 20, 70);
        }
    }

    /**
     * Рендерит заголовок с логотипом компании
     */
    private renderHeader(): void {
        try {
            // Логотип компании (прямоугольник вместо круга)
            this.doc.setFillColor('#F97316'); // Оранжевый цвет
            this.doc.rect(this.config.margins.left, this.currentY, 24, 24, 'F');
            
            // Текст в логотипе
            this.doc.setTextColor('#FFFFFF');
            this.doc.setFontSize(14);
            this.doc.text('СТНГ', this.config.margins.left + 3, this.currentY + 15);

            // Название компании
            this.doc.setTextColor('#000000');
            this.doc.setFont('times', 'bold');
            this.doc.setFontSize(16);
            this.doc.text('САХАТРАНСНЕФТЕГАЗ', this.config.margins.left + 30, this.currentY + 12);
            
            // Подразделение
            this.doc.setFontSize(12);
            this.doc.text('УСД', this.config.margins.left + 30, this.currentY + 20);

            // Сброс стилей
            this.doc.setTextColor('#000000');
            this.doc.setFont('times', 'normal');
            this.doc.setFontSize(12);

            this.currentY += 35;
            
            // Линия под заголовком
            this.doc.setDrawColor('#1E3A8A');
            this.doc.setLineWidth(1);
            this.doc.line(
                this.config.margins.left, 
                this.currentY, 
                this.pageWidth - this.config.margins.right, 
                this.currentY
            );
            
            this.addSpacing(10);
        } catch (error) {
            console.error('Ошибка рендеринга заголовка:', error);
            this.currentY += 30;
        }
    }

    /**
     * Рендерит заголовок документа
     */
    private renderTitle(actNumber: string, date: string): void {
        try {
            const centerX = this.pageWidth / 2;
            
            // Основной заголовок
            this.doc.setFont('times', 'bold');
            this.doc.setFontSize(16);
            
            // АКТ-НАРЯД №
            const titleText = `АКТ-НАРЯД № ${actNumber || '___________'}`;
            const titleWidth = this.doc.getTextWidth(titleText);
            this.doc.text(titleText, centerX - titleWidth / 2, this.currentY);
            
            this.addSpacing(8);

            // Подзаголовок
            this.doc.setFontSize(14);
            const subtitle1 = 'НА ОТКЛЮЧЕНИЕ ГАЗОИСПОЛЬЗУЮЩЕГО';
            const subtitle2 = 'ОБОРУДОВАНИЯ ЖИЛЫХ ЗДАНИЙ';
            
            const subtitle1Width = this.doc.getTextWidth(subtitle1);
            const subtitle2Width = this.doc.getTextWidth(subtitle2);
            
            this.doc.text(subtitle1, centerX - subtitle1Width / 2, this.currentY);
            this.addSpacing(6);
            this.doc.text(subtitle2, centerX - subtitle2Width / 2, this.currentY);
            
            this.addSpacing(12);

            // Дата
            this.doc.setFont('times', 'normal');
            this.doc.setFontSize(12);
            
            const dateText = this.formatDateString(date);
            const dateFullText = `«${dateText.day}» ${dateText.month} ${dateText.year} г.`;
            const dateWidth = this.doc.getTextWidth(dateFullText);
            this.doc.text(dateFullText, centerX - dateWidth / 2, this.currentY);

            this.addSpacing();
        } catch (error) {
            console.error('Ошибка рендеринга заголовка документа:', error);
            this.doc.text('АКТ-НАРЯД', this.config.margins.left, this.currentY);
            this.addSpacing();
        }
    }

    /**
     * Рендерит секцию представителя
     */
    private renderRepresentativeSection(representative: any): void {
        try {
            // Представителю эксплуатационной организации
            const line1 = `Представителю эксплуатационной организации ${representative.name || '_'.repeat(30)}`;
            this.addWrappedText(line1);
            
            this.addSpacing(3);
            
            // Подпись под полем
            this.doc.setFontSize(10);
            this.doc.setTextColor('#666666');
            this.doc.text('ф.и.о., должность', this.config.margins.left + 60, this.currentY);
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(12);
            
            this.addSpacing(8);
            
            // ввиду
            const reason = representative.reason || 'плановое техническое обслуживание';
            const reasonText = `ввиду ${reason}`;
            this.addWrappedText(reasonText);
            
            this.addSpacing(8);
            
            // поручается отключить
            const equipment = representative.equipment || 'газовое оборудование';
            const equipmentText = `поручается отключить ${equipment}`;
            this.addWrappedText(equipmentText);
            
            this.addSpacing(5);
            this.doc.setFontSize(10);
            this.doc.setTextColor('#666666');
            this.doc.text('наименование приборов', this.config.margins.left + 20, this.currentY);
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(12);
            
            this.addSpacing();
        } catch (error) {
            console.error('Ошибка рендеринга секции представителя:', error);
            this.doc.text('Представитель организации', this.config.margins.left, this.currentY);
            this.addSpacing();
        }
    }

    /**
     * Рендерит секцию наряда
     */
    private renderOrderSection(order: any): void {
        try {
            // Адрес
            const addressText = `в квартире № ${order.apartment || '___'} дома ${order.house || '___'} по ул. ${order.street || '_'.repeat(30)}`;
            this.addWrappedText(addressText);
            
            this.addSpacing(8);
            
            // у абонента
            const subscriberText = `у абонента ${order.subscriber || '_'.repeat(40)}`;
            this.addWrappedText(subscriberText);
            
            this.addSpacing(5);
            this.doc.setFontSize(10);
            this.doc.setTextColor('#666666');
            this.doc.text('ф.и.о.', this.config.margins.left + 20, this.currentY);
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(12);
            
            this.addSpacing(15);
            
            // Наряд выдал / получил
            const giverText = `Наряд выдал ${order.orderGiver?.name || '_'.repeat(20)}`;
            const receiverText = `Наряд получил ${order.orderReceiver?.name || '_'.repeat(20)}`;
            
            this.addWrappedText(giverText);
            this.addSpacing(5);
            this.addWrappedText(receiverText);
            
            this.addSpacing(5);
            this.doc.setFontSize(10);
            this.doc.setTextColor('#666666');
            this.doc.text('должность, ф.и.о., подпись', this.config.margins.left + 20, this.currentY);
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(12);
            
            this.addSpacing();
        } catch (error) {
            console.error('Ошибка рендеринга секции наряда:', error);
            this.doc.text('Задание на работы', this.config.margins.left, this.currentY);
            this.addSpacing();
        }
    }

    /**
     * Рендерит секцию выполнения
     */
    private renderExecutionSection(execution: any): void {
        try {
            // Фон для секции выполнения
            this.doc.setFillColor('#f9f9f9');
            const sectionHeight = 60;
            this.doc.rect(this.config.margins.left - 2, this.currentY - 5, this.contentWidth + 4, sectionHeight, 'F');
            
            // Мною
            const executorText = `Мною ${execution.executor || '_'.repeat(40)}`;
            this.addWrappedText(executorText);
            
            this.addSpacing(5);
            this.doc.setFontSize(10);
            this.doc.setTextColor('#666666');
            this.doc.text('должность, ф.и.о.', this.config.margins.left + 20, this.currentY);
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(12);
            
            this.addSpacing(8);
            
            // Дата и время выполнения
            const execDate = this.formatDateString(execution.executionDate);
            const execTime = this.formatTimeString(execution.executionTime);
            
            const dateTimeText = `«${execDate.day}» ${execDate.month} ${execDate.year} г. в ${execTime.hours} ч. ${execTime.minutes} мин.`;
            this.addWrappedText(dateTimeText);
            
            this.addSpacing(8);
            
            // произведено отключение
            const disconnectionText = `произведено отключение газоиспользующего оборудования ${execution.disconnectedEquipment || '_'.repeat(30)}`;
            this.addWrappedText(disconnectionText);
            
            this.addSpacing(5);
            this.doc.setFontSize(10);
            this.doc.setTextColor('#666666');
            this.doc.text('указать наименование, количество приборов, способ отключения', this.config.margins.left + 20, this.currentY);
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(12);
            
            this.addSpacing(15);
            
            // Подписи
            this.doc.setFont('times', 'bold');
            this.doc.text('Подписи:', this.config.margins.left, this.currentY);
            this.doc.setFont('times', 'normal');
            this.addSpacing(5);
            
            const repSignature = execution.representativeSignature?.name || '_'.repeat(25);
            const subSignature = execution.subscriberSignature?.name || '_'.repeat(25);
            
            this.doc.text(`Представитель эксплуатационной организации ${repSignature}`, this.config.margins.left, this.currentY);
            this.addSpacing(8);
            this.doc.text(`Ответственный квартиросъёмщик (абонент) ${subSignature}`, this.config.margins.left, this.currentY);
            
            this.addSpacing();
        } catch (error) {
            console.error('Ошибка рендеринга секции выполнения:', error);
            this.doc.text('Выполнение работ', this.config.margins.left, this.currentY);
            this.addSpacing();
        }
    }

    /**
     * Рендерит секцию подключения
     */
    private renderReconnectionSection(reconnection: any): void {
        try {
            this.addSpacing(10);
            
            // Фон для секции подключения
            this.doc.setFillColor('#f0f8ff');
            const sectionHeight = 50;
            this.doc.rect(this.config.margins.left - 2, this.currentY - 5, this.contentWidth + 4, sectionHeight, 'F');
            
            // Газоиспользующее оборудование подключено
            const reconnDate = this.formatDateString(reconnection.reconnectionDate);
            const reconnectionText = `Газоиспользующее оборудование подключено «${reconnDate.day}» ${reconnDate.month} ${reconnDate.year} г.`;
            this.addWrappedText(reconnectionText);
            
            this.addSpacing(8);
            
            // представителем эксплуатационной организации
            const reconnByText = `представителем эксплуатационной организации ${reconnection.reconnectionBy || '_'.repeat(30)}`;
            this.addWrappedText(reconnByText);
            
            this.addSpacing(8);
            
            // по указанию
            const orderText = `по указанию ${reconnection.reconnectionOrder || '_'.repeat(40)}`;
            this.addWrappedText(orderText);
            
            this.addSpacing(8);
            
            // адрес и абонент
            const addressText = `в квартире № ${reconnection.apartment || '___'} дома ${reconnection.house || '___'} по ул. ${reconnection.street || '_'.repeat(30)}`;
            this.addWrappedText(addressText);
            
            this.addSpacing(5);
            const subscriberText = `у абонента ${reconnection.subscriber || '_'.repeat(40)}`;
            this.addWrappedText(subscriberText);
            
            this.addSpacing(8);
            
            // Подписи для подключения
            this.doc.setFont('times', 'bold');
            this.doc.text('Подписи:', this.config.margins.left, this.currentY);
            this.doc.setFont('times', 'normal');
            this.addSpacing(5);
            
            const repSignature = reconnection.representativeSignature?.name || '_'.repeat(25);
            const subSignature = reconnection.subscriberSignature?.name || '_'.repeat(25);
            
            this.doc.text(`Представитель эксплуатационной организации ${repSignature}`, this.config.margins.left, this.currentY);
            this.addSpacing(8);
            this.doc.text(`Ответственный квартиросъёмщик (абонент) ${subSignature}`, this.config.margins.left, this.currentY);
            
            this.addSpacing();
        } catch (error) {
            console.error('Ошибка рендеринга секции подключения:', error);
            this.doc.text('Подключение оборудования', this.config.margins.left, this.currentY);
            this.addSpacing();
        }
    }

    /**
     * Рендерит футер документа
     */
    private renderFooter(): void {
        try {
            this.addSpacing(15);
            
            // Примечание
            this.doc.setFont('times', 'bold');
            this.doc.text('Примечание:', this.config.margins.left, this.currentY);
            this.doc.setFont('times', 'normal');
            
            this.addSpacing(5);
            
            const noteText = 'Акт-наряд составляется в двух экземплярах, один из которых выдаётся на руки абоненту, другой хранится в эксплуатационной организации.';
            this.addWrappedText(noteText, 10);
        } catch (error) {
            console.error('Ошибка рендеринга футера:', error);
        }
    }

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================

    /**
     * Добавляет многострочный текст с переносами
     */
    private addWrappedText(text: string, fontSize: number = 12): void {
        this.doc.setFontSize(fontSize);
        const lines = this.doc.splitTextToSize(text, this.contentWidth - 10);
        
        for (let i = 0; i < lines.length; i++) {
            this.doc.text(lines[i], this.config.margins.left, this.currentY);
            if (i < lines.length - 1) {
                this.currentY += this.config.elements.lineHeight;
            }
        }
        
        this.doc.setFontSize(12); // Возвращаем стандартный размер
    }

    /**
     * Форматирует дату из ISO строки
     */
    private formatDateString(isoDate: string): { day: string; month: string; year: string } {
        if (!isoDate) {
            return { day: '___', month: '___________', year: '____' };
        }
        
        try {
            const date = new Date(isoDate);
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            
            const months = [
                'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
            ];
            const month = months[date.getMonth()];
            
            return { day, month, year };
        } catch (error) {
            return { day: '___', month: '___________', year: '____' };
        }
    }

    /**
     * Форматирует время из строки
     */
    private formatTimeString(timeString: string): { hours: string; minutes: string } {
        if (!timeString) {
            return { hours: '__', minutes: '__' };
        }
        
        try {
            const [hours, minutes] = timeString.split(':');
            return {
                hours: hours || '__',
                minutes: minutes || '__'
            };
        } catch (error) {
            return { hours: '__', minutes: '__' };
        }
    }
}