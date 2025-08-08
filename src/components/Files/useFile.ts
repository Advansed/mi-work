import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { jsPDF } from "jspdf";
import { FilePicker } from '@capawesome/capacitor-file-picker';

// ============================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================

export interface FileInfo {
    id?: string;
    name: string;
    url?: string;
    dataUrl?: string;
    format?: string;
    size?: number;
    type?: string;
}

export interface CameraResult {
    dataUrl?: string;
    format?: string;
    webPath?: string;
}

export interface PDFPage {
    dataUrl: string;
    format?: string;
}

export interface PDFConfig {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    pageFormat: 'a4' | 'letter';
    orientation: 'p' | 'l';
}

export interface FileOperationsState {
    files: FileInfo[];
    isLoading: boolean;
    currentIndex: number;
    modalVisible: boolean;
    modalContent: any;
    message: string;
    uploadProgress: number;
}

export interface UseFileOperationsReturn {
    // Состояния
    state: FileOperationsState;
    
    // Методы для файлов
    takePicture: () => Promise<CameraResult>;
    pickFiles: () => Promise<void>;
    convertToPDF: (pages: PDFPage[], name: string) => Promise<string>;
    
    // Управление состоянием
    setCurrentIndex: (index: number) => void;
    setModalVisible: (visible: boolean) => void;
    setMessage: (message: string) => void;
    addFile: (file: FileInfo) => void;
    removeFile: (index: number) => void;
    clearFiles: () => void;
}

// ============================================
// ХУКА useFileOperations
// ============================================

export const useFileOperations = (initialConfig?: Partial<PDFConfig>): UseFileOperationsReturn => {
    // Состояния
    const [state, setState] = useState<FileOperationsState>({
        files: [],
        isLoading: false,
        currentIndex: 0,
        modalVisible: false,
        modalContent: null,
        message: '',
        uploadProgress: 0
    });

    // Конфигурация PDF
    const pdfConfig: PDFConfig = {
        quality: 90,
        maxWidth: 1000,
        maxHeight: 1000,
        pageFormat: 'a4',
        orientation: 'p',
        ...initialConfig
    };

    // ============================================
    // МЕТОДЫ РАБОТЫ С КАМЕРОЙ И ФАЙЛАМИ
    // ============================================

    const takePicture = async (): Promise<CameraResult> => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            
            const image = await Camera.getPhoto({
                quality: pdfConfig.quality,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt
            });

            let format = 'jpeg';
            if (image.dataUrl) {
                const arr = image.dataUrl.split(";");
                if (arr.length > 0) {
                    const formatArr = arr[0].split("/");
                    if (formatArr.length > 1) {
                        format = formatArr[1];
                    }
                }
            }

            const result: CameraResult = {
                dataUrl: image.dataUrl,
                format: format,
                webPath: image.webPath
            };

            setState(prev => ({ ...prev, isLoading: false }));
            return result;
            
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                isLoading: false,
                message: `Ошибка камеры: ${error}`
            }));
            throw error;
        }
    };

    const pickFiles = async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            
            const result = await FilePicker.pickFiles({
                types: ['image/*', 'application/pdf'],
                // multiple: true
            });

            const newFiles: FileInfo[] = result.files.map(file => ({
                id: Math.random().toString(36),
                name: file.name,
                dataUrl: `data:${file.mimeType};base64,${file.data}`,
                size: file.size,
                type: file.mimeType
            }));

            setState(prev => ({ 
                ...prev, 
                files: [...prev.files, ...newFiles],
                isLoading: false 
            }));
            
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                isLoading: false,
                message: `Ошибка выбора файлов: ${error}`
            }));
        }
    };

    const convertToPDF = async (pages: PDFPage[], name: string): Promise<string> => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            
            const doc = new jsPDF(pdfConfig.orientation, 'mm', pdfConfig.pageFormat);
            
            for (let i = 0; i < pages.length; i++) {
                const img = new Image();
                img.src = pages[i].dataUrl;
                await img.decode();
                
                let width = img.width;
                let height = img.height;

                // Масштабирование изображения
                let scale = 1;
                if (width > pdfConfig.maxWidth) scale = pdfConfig.maxWidth / width;
                if (height > pdfConfig.maxHeight && (pdfConfig.maxHeight / height) < scale) {
                    scale = pdfConfig.maxHeight / height;
                }

                width = Math.floor(width * scale);
                height = Math.floor(height * scale);

                // Создание canvas для ресайза
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                if (!ctx) {
                    throw new Error('Не удалось создать canvas context');
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg');
                
                // Расчет размеров для PDF страницы
                const pageScale = Math.max(width / 210, height / 297);
                
                if (i > 0) doc.addPage();
                
                doc.addImage(
                    dataUrl, 
                    "jpeg", 
                    0, 
                    0, 
                    Math.floor(width / pageScale), 
                    Math.floor(height / pageScale)
                );
            }

            const pdfDataUri = doc.output("datauristring", { filename: name });
            
            setState(prev => ({ ...prev, isLoading: false }));
            return pdfDataUri;
            
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                isLoading: false,
                message: `Ошибка создания PDF: ${error}`
            }));
            throw error;
        }
    };

    // ============================================
    // УПРАВЛЕНИЕ СОСТОЯНИЕМ
    // ============================================

    const setCurrentIndex = (index: number): void => {
        setState(prev => ({ ...prev, currentIndex: index }));
    };

    const setModalVisible = (visible: boolean): void => {
        setState(prev => ({ ...prev, modalVisible: visible }));
    };

    const setMessage = (message: string): void => {
        setState(prev => ({ ...prev, message }));
    };

    const addFile = (file: FileInfo): void => {
        setState(prev => ({ 
            ...prev, 
            files: [...prev.files, { ...file, id: file.id || Math.random().toString(36) }]
        }));
    };

    const removeFile = (index: number): void => {
        setState(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
            currentIndex: prev.currentIndex >= index ? Math.max(0, prev.currentIndex - 1) : prev.currentIndex
        }));
    };

    const clearFiles = (): void => {
        setState(prev => ({ 
            ...prev, 
            files: [], 
            currentIndex: 0,
            message: ''
        }));
    };

    return {
        state,
        takePicture,
        pickFiles,
        convertToPDF,
        setCurrentIndex,
        setModalVisible,
        setMessage,
        addFile,
        removeFile,
        clearFiles
    };
};