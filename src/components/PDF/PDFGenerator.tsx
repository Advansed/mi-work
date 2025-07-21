// ============================================
// ИСПРАВЛЕННЫЙ ОСНОВНОЙ КЛАСС PDF ГЕНЕРАТОРА
// ============================================

import jsPDF from 'jspdf';
import { PDFConfig, ActOrderData } from './types';
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
     * Создает упрощенный документ при ошибке генерации
     */
    private createFallbackDocument(data: ActOrderData): void {
        try {
            console.log('🔄 Создаем упрощенный документ...');
            
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
            
            if (data.representative?.name) {
                FontLoader.addTextSafe(this.doc, `Представитель: ${data.representative.name}`, 20, 90);
            }
            
            if (data.order?.street || data.order?.house) {
                const address = `${data.order.street || ''} ${data.order.house || ''}`.trim();
                FontLoader.addTextSafe(this.doc, `Адрес: ${address}`, 20, 110);
            }
            
            FontLoader.addTextSafe(this.doc, 'Документ создан с ограниченным функционалом', 20, 140);
            
            console.log('✅ Упрощенный документ создан');
        } catch (fallbackError) {
            console.error('❌ Ошибка создания упрощенного документа:', fallbackError);
        }
    }

    // ============================================
    // СОХРАНЕНИЕ И ЭКСПОРТ
    // ============================================

    /**
     * Сохраняет PDF файл
     */
    public savePDF(filename: string = 'document.pdf'): void {
        try {
            this.doc.save(filename);
            console.log(`✅ PDF сохранен: ${filename}`);
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
            return this.doc.output('blob');
        } catch (error) {
            console.error('❌ Ошибка создания Blob:', error);
            throw new Error('Не удалось создать Blob');
        }
    }

    /**
     * Возвращает PDF как base64 строку для предпросмотра
     */
    public getBase64(): string {
        try {
            return this.doc.output('datauristring');
        } catch (error) {
            console.error('❌ Ошибка создания base64:', error);
            throw new Error('Не удалось создать base64');
        }
    }

    /**
     * Возвращает ArrayBuffer для отправки
     */
    public getArrayBuffer(): ArrayBuffer {
        try {
            return this.doc.output('arraybuffer');
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
                    console.warn('⚠️ Автоматическая печать недоступна, открываем в новом окне');
                    window.open(url, '_blank');
                }
                
                // Удаляем iframe через некоторое время
                setTimeout(() => {
                    try {
                        document.body.removeChild(iframe);
                        URL.revokeObjectURL(url);
                    } catch (cleanupError) {
                        console.warn('⚠️ Ошибка очистки ресурсов печати');
                    }
                }, 1000);
            };
        } catch (error) {
            console.error('❌ Ошибка печати:', error);
            throw new Error('Не удалось отправить на печать');
        }
    }

    // ============================================
    // МОБИЛЬНЫЕ ФУНКЦИИ
    // ============================================

    /**
     * Поделиться файлом (для мобильных устройств)
     */
    public async share(filename: string = 'document.pdf'): Promise<void> {
        try {
            if (navigator.share && navigator.canShare) {
                const blob = this.getBlob();
                const file = new File([blob], filename, { type: 'application/pdf' });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'АКТ-НАРЯД',
                        text: 'Документ АКТ-НАРЯД на отключение газового оборудования',
                        files: [file]
                    });
                    return;
                }
            }
            
            // Fallback: скачиваем файл
            this.savePDF(filename);
        } catch (error) {
            console.error('❌ Ошибка при попытке поделиться:', error);
            // Fallback: скачиваем файл
            this.savePDF(filename);
        }
    }

    /**
     * Сохраняет в файловую систему устройства (мобильное)
     */
    public async saveToDevice(filename: string = 'document.pdf'): Promise<boolean> {
        try {
            // Для веб-платформы просто скачиваем
            if (!('showSaveFilePicker' in window)) {
                this.savePDF(filename);
                return true;
            }

            // Для современных браузеров с File System API
            const fileHandle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'PDF файлы',
                    accept: { 'application/pdf': ['.pdf'] }
                }]
            });

            const writable = await fileHandle.createWritable();
            const blob = this.getBlob();
            await writable.write(blob);
            await writable.close();

            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения на устройство:', error);
            // Fallback: обычное скачивание
            this.savePDF(filename);
            return false;
        }
    }

    // ============================================
    // УТИЛИТЫ
    // ============================================

    /**
     * Получает информацию о документе
     */
    public getDocumentInfo(): {
        pageCount: number;
        format: string;
        orientation: string;
        size: number; // в байтах
    } {
        try {
            const blob = this.getBlob();
            
            return {
                pageCount: this.doc.getNumberOfPages(),
                format: this.config.format,
                orientation: this.config.orientation,
                size: blob.size
            };
        } catch (error) {
            console.error('❌ Ошибка получения информации о документе:', error);
            return {
                pageCount: 1,
                format: this.config.format,
                orientation: this.config.orientation,
                size: 0
            };
        }
    }

    /**
     * Проверяет состояние генератора
     */
    public getStatus(): {
        initialized: boolean;
        hasContent: boolean;
        fontInfo: any;
        error?: string;
    } {
        try {
            return {
                initialized: this.initialized,
                hasContent: this.doc.getNumberOfPages() > 0,
                fontInfo: FontLoader.getFontInfo(this.doc)
            };
        } catch (error) {
            return {
                initialized: this.initialized,
                hasContent: false,
                fontInfo: null,
                error: getErrorMessage( error ) 
            };
        }
    }

    /**
     * Сбрасывает документ для создания нового
     */
    public reset(): void {
        try {
            this.createDocument();
            console.log('✅ PDFGenerator сброшен');
        } catch (error) {
            console.error('❌ Ошибка сброса PDFGenerator:', error);
        }
    }

    /**
     * Проверяет, инициализирован ли генератор
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Получает текущую конфигурацию
     */
    public getConfig(): PDFConfig {
        return { ...this.config };
    }

    /**
     * Обновляет конфигурацию
     */
    public updateConfig(newConfig: Partial<PDFConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('✅ Конфигурация обновлена');
    }
}