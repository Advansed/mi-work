// ============================================
// ИСПРАВЛЕННЫЙ ОСНОВНОЙ КЛАСС PDF ГЕНЕРАТОРА
// ============================================

import jsPDF from 'jspdf';
import { PDFConfig, ActOrderData, ActPlombData } from './types';
import { DEFAULT_PDF_CONFIG } from './config';
import { FontLoader, getErrorMessage } from './utils/fontLoader';
import { ActOrderTemplate } from './templates/ActOrderTemplate';

export class PDFGenerator {
    private doc!: jsPDF; // Definite assignment assertion
    private config: PDFConfig;
    private initialized: boolean = false;

    constructor(config?: Partial<PDFConfig>) {
        this.config = { ...DEFAULT_PDF_CONFIG, ...config };
        this.createDocument();
    }

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================

    /**
     * Инициализирует генератор (загружает шрифты и настройки)
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await FontLoader.loadFonts(this.doc);
            
            // Устанавливаем базовые настройки
            FontLoader.setFontSafe(this.doc, 'times', 'normal', 12);
            this.doc.setTextColor(this.config.colors.text);
            
            // Проверяем поддержку кириллицы
            const cyrillicSupport = FontLoader.checkCyrillicSupport(this.doc);
            if (!cyrillicSupport) {
                console.warn('⚠️ Ограниченная поддержка кириллицы');
            }
            
            this.initialized = true;
            console.log('✅ PDFGenerator инициализирован', {
                cyrillicSupport,
                fontInfo: FontLoader.getFontInfo(this.doc)
            });
        } catch (error) {
            console.error('❌ Ошибка инициализации PDFGenerator:', error);
            // Помечаем как инициализированный чтобы не блокировать работу
            this.initialized = true;
        }
    }

    /**
     * Создает новый PDF документ
     */
    private createDocument(): void {
        try {
            this.doc = new jsPDF({
                orientation: this.config.orientation,
                unit: 'mm',
                format: this.config.format
            });

            // Устанавливаем стандартные параметры
            FontLoader.setFontSafe(this.doc, 'times', 'normal', this.config.fonts.regular.size);
            this.doc.setTextColor(this.config.colors.text);
            
            console.log('✅ PDF документ создан');
        } catch (error) {
            console.error('❌ Ошибка создания PDF документа:', error);
            throw new Error('Не удалось создать PDF документ');
        }
    }

    // ============================================
    // ГЕНЕРАЦИЯ ДОКУМЕНТОВ
    // ============================================

    
    /**
     * Генерирует АКТ-НАРЯД
     */
    public async generateActOrder(data: ActOrderData): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            console.log('🔄 Начинаем генерацию АКТ-НАРЯДА с данными:', data);
            
            // Проверяем данные
            if (!data || typeof data !== 'object') {
                throw new Error('Данные для генерации не переданы или неверного формата');
            }

            const template = new ActOrderTemplate(this.doc, this.config);
            template.renderDocument(data);
            
            console.log('✅ АКТ-НАРЯД сгенерирован успешно');
        } catch (error) {
            console.error('❌ Ошибка генерации АКТ-НАРЯДА:', error);
            
            // Создаем минимальный документ при ошибке
            this.createFallbackDocument(data);
            
            throw new Error(`Не удалось сгенерировать АКТ-НАРЯД: ${ getErrorMessage(error) }`);
        }
    }

 /**
     * ИСПРАВЛЕННАЯ генерация АКТА ПЛОМБИРОВАНИЯ с поддержкой кириллицы
     */
    public async generateActPlomb(data: ActPlombData): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            console.log('🔄 Начинаем генерацию АКТА ПЛОМБИРОВАНИЯ с данными:', data);
            
            // Проверяем данные
            if (!data || typeof data !== 'object') {
                throw new Error('Данные для генерации не переданы или неверного формата');
            }

            // Валидация обязательных полей
            if (!data.subscriber_name?.trim()) {
                throw new Error('ФИО абонента обязательно для генерации акта');
            }

            if (!data.act_date) {
                throw new Error('Дата акта обязательна для генерации');
            }

            // Очищаем документ и настраиваем кириллицу
            this.createDocument();
            await this.setupCyrillicSupport();

            // Импортируем исправленный шаблон
            const { ActPlombTemplate } = await import('./templates/ActplombTemplate');
            const template = new ActPlombTemplate(this.doc, this.config);
            
            // Рендерим документ
            template.renderDocument(data);
            
            console.log('✅ АКТ ПЛОМБИРОВАНИЯ сгенерирован успешно');
        } catch (error) {
            console.error('❌ Ошибка генерации АКТА ПЛОМБИРОВАНИЯ:', error);
            
            // Создаем минимальный документ при ошибке
            this.createPlombFallbackDocument(data);
            
            throw new Error(`Не удалось сгенерировать АКТ ПЛОМБИРОВАНИЯ: ${ getErrorMessage(error) }`);
        }
    }

    /**
     * Настройка поддержки кириллицы
     */
    private async setupCyrillicSupport(): Promise<void> {
        try {
            console.log('🔄 Настраиваем поддержку кириллицы...');
            
            // Устанавливаем базовый шрифт Times
            this.doc.setFont('times', 'normal');
            this.doc.setFontSize(12);
            this.doc.setTextColor(0, 0, 0);
            
            // Проверяем поддержку кириллицы
            const testText = 'Тест кириллицы АБВ абв';
            try {
                this.doc.text(testText, -100, -100); // Тестируем вне видимой области
                console.log('✅ Кириллица поддерживается');
            } catch (cyrillicError) {
                console.warn('⚠️ Ограниченная поддержка кириллицы:', cyrillicError);
            }
            
        } catch (error) {
            console.warn('⚠️ Ошибка настройки кириллицы:', error);
        }
    }

    private createPlombFallbackDocument(data: ActPlombData): void {
        try {
            console.log('🔄 Создаем упрощенный документ АКТА ПЛОМБИРОВАНИЯ...');
            
            // Очищаем документ
            this.createDocument();
            
            // Настраиваем шрифт
            this.doc.setFont('times', 'bold');
            this.doc.setFontSize(16);
            this.doc.text('АКТ ПЛОМБИРОВАНИЯ ПРИБОРА УЧЕТА ГАЗА', 20, 30);
            
            this.doc.setFont('times', 'normal');
            this.doc.setFontSize(12);
            
            let yPos = 50;
            
            // Основная информация
            if (data.act_number) {
                this.doc.text(`№ ${data.act_number}`, 20, yPos);
                yPos += 10;
            }
            
            if (data.act_date) {
                try {
                    const date = new Date(data.act_date).toLocaleDateString('ru-RU');
                    this.doc.text(`Дата: ${date}`, 20, yPos);
                } catch (dateError) {
                    this.doc.text(`Дата: ${data.act_date}`, 20, yPos);
                }
                yPos += 10;
            }
            
            if (data.subscriber_name) {
                this.doc.text(`Абонент: ${data.subscriber_name}`, 20, yPos);
                yPos += 10;
            }
            
            // Адрес
            const address = data.address || (data.street && data.house && data.apartment 
                ? `${data.street}, ${data.house}, кв. ${data.apartment}` 
                : '');
            if (address) {
                this.doc.text(`Адрес: ${address}`, 20, yPos);
                yPos += 10;
            }
            
            if (data.usd_representative) {
                this.doc.text(`Представитель УСД: ${data.usd_representative}`, 20, yPos);
                yPos += 10;
            }
            
            // Список счетчиков
            if (data.meters && data.meters.length > 0) {
                yPos += 10;
                this.doc.text('Приборы учета:', 20, yPos);
                yPos += 10;
                
                data.meters.forEach((meter, index) => {
                    if (yPos > this.doc.internal.pageSize.getHeight() - 40) {
                        this.doc.addPage();
                        yPos = 30;
                    }
                    
                    const meterText = `${index + 1}. Счетчик №${meter.meter_number || 'не указан'}, пломба №${meter.seal_number || 'не указана'}`;
                    this.doc.text(meterText, 25, yPos);
                    yPos += 8;
                    
                    if (meter.current_reading) {
                        this.doc.text(`   Показания: ${meter.current_reading}м³`, 25, yPos);
                        yPos += 8;
                    }
                    
                    yPos += 5;
                });
            }
            
            // Примечание об упрощенном режиме
            const noteY = this.doc.internal.pageSize.getHeight() - 40;
            this.doc.setFontSize(10);
            this.doc.text('Документ создан в упрощенном режиме из-за ошибки генерации', 20, noteY);
            
            console.log('✅ Упрощенный документ АКТА ПЛОМБИРОВАНИЯ создан');
        } catch (fallbackError) {
            console.error('❌ Ошибка создания упрощенного документа АКТА ПЛОМБИРОВАНИЯ:', fallbackError);
            
            // Создаем минимальный документ
            this.doc.setFont('times', 'normal');
            this.doc.setFontSize(12);
            this.doc.text('АКТ ПЛОМБИРОВАНИЯ', 20, 30);
            this.doc.text('Ошибка генерации документа', 20, 50);
            if (data.subscriber_name) {
                this.doc.text(`Абонент: ${data.subscriber_name}`, 20, 70);
            }
        }
    }
    
    private createFallbackDocument(data: ActOrderData): void {
        try {
            console.log('🔄 Создаем упрощенный документ АКТ-НАРЯДА...');
            
            // Очищаем документ
            this.createDocument();
            
            // Добавляем базовую информацию
            FontLoader.setFontSafe(this.doc, 'times', 'bold', 16);
            FontLoader.addTextSafe(this.doc, 'АКТ-НАРЯД', 20, 30);
            
            FontLoader.setFontSafe(this.doc, 'times', 'normal', 12);
            FontLoader.addTextSafe(this.doc, `№ ${data.actNumber || 'Не указан'}`, 20, 50);
            
            if (data.date) {
                const date = new Date(data.date).toLocaleDateString('ru-RU');
                FontLoader.addTextSafe(this.doc, `Дата: ${date}`, 20, 70);
            }
            
            FontLoader.addTextSafe(this.doc, 'Документ создан в упрощенном режиме из-за ошибки генерации', 20, 100);
            
            console.log('✅ Упрощенный документ АКТ-НАРЯДА создан');
        } catch (fallbackError) {
            console.error('❌ Ошибка создания упрощенного документа АКТ-НАРЯДА:', fallbackError);
        }
    }


    // ============================================
    // ЭКСПОРТ И СОХРАНЕНИЕ
    // ============================================

    /**
     * Сохраняет PDF как файл
     */
    public savePDF(filename: string = 'document.pdf'): void {
        try {
            this.doc.save(filename);
            console.log(`✅ PDF сохранен как: ${filename}`);
        } catch (error) {
            console.error('❌ Ошибка сохранения PDF:', error);
            throw new Error('Не удалось сохранить PDF файл');
        }
    }

    /**
     * Возвращает PDF как Blob
     */
    public getBlob(): Blob {
        try {
            const blob = this.doc.output('blob');
            console.log('✅ Blob создан');
            return blob;
        } catch (error) {
            console.error('❌ Ошибка создания Blob:', error);
            throw new Error('Не удалось создать Blob');
        }
    }

    /**
     * Возвращает PDF как ArrayBuffer
     */
    public getArrayBuffer(): ArrayBuffer {
        try {
            const buffer = this.doc.output('arraybuffer');
            console.log('✅ ArrayBuffer создан');
            return buffer;
        } catch (error) {
            console.error('❌ Ошибка создания ArrayBuffer:', error);
            throw new Error('Не удалось создать ArrayBuffer');
        }
    }

    // ============================================
    // ПРЕДПРОСМОТР
    // ============================================

    /**
     * Открывает PDF в новом окне для предпросмотра
     */
    public preview(): void {
        try {
            const blob = this.getBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            // Освобождаем URL через некоторое время
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('❌ Ошибка предпросмотра:', error);
            throw new Error('Не удалось открыть предпросмотр');
        }
    }

    /**
     * Возвращает URL для встраивания в iframe
     */
    public getPreviewUrl(): string {
        try {
            const blob = this.getBlob();
            const url = URL.createObjectURL(blob);
            console.log('✅ URL для предпросмотра создан');
            return url;
        } catch (error) {
            console.error('❌ Ошибка создания URL предпросмотра:', error);
            throw new Error('Не удалось создать URL предпросмотра');
        }
    }

    // ============================================
    // ПЕЧАТЬ
    // ============================================

    /**
     * Отправляет документ на печать
     */
    public print(): void {
        try {
            const blob = this.getBlob();
            const url = URL.createObjectURL(blob);
            
            // Создаем скрытый iframe для печати
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            
            document.body.appendChild(iframe);
            
            iframe.onload = () => {
                try {
                    iframe.contentWindow?.print();
                } catch (printError) {
                    console.warn('⚠️ Автоматическая печать не поддерживается, открываем в новом окне');
                    window.open(url, '_blank');
                }
                
                // Очищаем после использования
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
                }, 1000);
            };
            
            console.log('✅ Документ отправлен на печать');
        } catch (error) {
            console.error('❌ Ошибка печати:', error);
            throw new Error('Не удалось распечатать документ');
        }
    }

    // ============================================
    // ПОДЕЛИТЬСЯ
    // ============================================

    /**
     * Делится документом через Web Share API (если поддерживается)
     */
    public async share(filename: string = 'document.pdf'): Promise<void> {
        try {
            if (!navigator.share) {
                throw new Error('Web Share API не поддерживается');
            }

            const blob = this.getBlob();
            const file = new File([blob], filename, { type: 'application/pdf' });

            await navigator.share({
                title: 'PDF документ',
                text: 'Поделиться PDF документом',
                files: [file]
            });

            console.log('✅ Документ успешно передан');
        } catch (error) {
            console.error('❌ Ошибка при передаче документа:', error);
            
            // Fallback - скачиваем файл
            this.savePDF(filename);
        }
    }

    // ============================================
    // УТИЛИТЫ
    // ============================================

    /**
     * Возвращает информацию о документе
     */
    public getDocumentInfo(): any {
        return {
            pageCount: this.doc.getNumberOfPages(),
            pageSize: {
                width: this.doc.internal.pageSize.getWidth(),
                height: this.doc.internal.pageSize.getHeight()
            },
            config: this.config,
            initialized: this.initialized
        };
    }

    /**
     * Очищает документ и создает новый
     */
    public reset(): void {
        try {
            this.createDocument();
            console.log('✅ Документ сброшен');
        } catch (error) {
            console.error('❌ Ошибка сброса документа:', error);
            throw new Error('Не удалось сбросить документ');
        }
    }

    /**
     * Освобождает ресурсы
     */
    public dispose(): void {
        try {
            // Очищаем ссылки
            delete (this as any).doc;
            delete (this as any).config;
            
            console.log('✅ Ресурсы PDFGenerator освобождены');
        } catch (error) {
            console.error('❌ Ошибка освобождения ресурсов:', error);
        }
    }
}