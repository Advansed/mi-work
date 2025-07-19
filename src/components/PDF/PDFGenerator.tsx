// ============================================
// ОСНОВНОЙ КЛАСС PDF ГЕНЕРАТОРА
// ============================================

import jsPDF from 'jspdf';
import { PDFConfig, ActOrderData } from './types';
import { DEFAULT_PDF_CONFIG } from './config';
import { FontLoader } from './utils/fontLoader';
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
            this.initialized = true;
            console.log('✅ PDFGenerator инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации PDFGenerator:', error);
            throw error;
        }
    }

    /**
     * Создает новый PDF документ
     */
    private createDocument(): void {
        this.doc = new jsPDF({
            orientation: this.config.orientation,
            unit: 'mm',
            format: this.config.format
        });

        // Устанавливаем стандартные параметры
        this.doc.setFont('times', 'normal');
        this.doc.setFontSize(this.config.fonts.regular.size);
        this.doc.setTextColor(this.config.colors.text);
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
            const template = new ActOrderTemplate(this.doc, this.config);
            template.renderDocument(data);
            
            console.log('✅ АКТ-НАРЯД сгенерирован');
        } catch (error) {
            console.error('❌ Ошибка генерации АКТ-НАРЯДА:', error);
            throw new Error('Не удалось сгенерировать АКТ-НАРЯД');
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
            return URL.createObjectURL(blob);
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
                iframe.contentWindow?.print();
                
                // Удаляем iframe через некоторое время
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
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
        const blob = this.getBlob();
        
        return {
            pageCount: this.doc.getNumberOfPages(),
            format: this.config.format,
            orientation: this.config.orientation,
            size: blob.size
        };
    }

    /**
     * Сбрасывает документ для создания нового
     */
    public reset(): void {
        this.createDocument();
        console.log('✅ PDFGenerator сброшен');
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