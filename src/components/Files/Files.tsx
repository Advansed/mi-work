import React, { useState } from "react";
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { cameraOutline, sendOutline } from "ionicons/icons";
import { IonButton, IonChip, IonIcon, IonLoading, IonModal } from "@ionic/react";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { RenderCurrentScaleProps, RenderZoomInProps, RenderZoomOutProps, zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

// Импорт хука и типов
import { useFileOperations, FileInfo, PDFPage } from './useFile';

defineCustomElements(window);

// ============================================
// ИНТЕРФЕЙСЫ КОМПОНЕНТОВ
// ============================================


interface FilesMultiProps {
    info: Array<{
        Файлы: FileInfo[];
        Имя: string;
        Описание: string;
    }>;
}

// ============================================
// УТИЛИТАРНЫЕ ФУНКЦИИ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
// ============================================

export const takePicture = async () => {
    const fileOps = useFileOperations();
    return await fileOps.takePicture();
};

export const toPDF = async (pages: PDFPage[], name: string) => {
    const fileOps = useFileOperations();
    return await fileOps.convertToPDF(pages, name);
};


export function PDFDoc( props ){

    const zoomPluginInstance = zoomPlugin();
    const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;

    const base64toBlob = (data: string) => {
        
        const jarr = data.split(",")

        const base64WithoutPrefix = jarr[1] //data.substr('data:application/pdf;base64,'.length);
    
        const bytes = atob(base64WithoutPrefix);

        let length = bytes.length;
        const out = new Uint8Array(length);
    
        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }
    
        return new Blob([out], { type: 'application/pdf' });
    };

    const blob = base64toBlob( props.url );
    const url = URL.createObjectURL(blob);

    return <>
        <div className="h-3 pl-2 w-100 bg-2 flex">
            <div>PDF view</div>
            <div className="ml-1">
                <ZoomOut>
                    {(props: RenderZoomOutProps) => (
                        <IonButton
                            onClick={props.onClick}
                        >
                            -
                        </IonButton>
                    )}
                </ZoomOut>
            </div>
            <div className="ml-1">
                <CurrentScale>
                    {(props: RenderCurrentScaleProps) => <>{`${Math.round(props.scale * 100)}%`}</>}
                </CurrentScale>
            </div>
            <div className="ml-1">
                <ZoomIn>
                    {(props: RenderZoomInProps) => (
                        <IonButton
                            onClick={props.onClick}
                        >
                            +
                        </IonButton>
                    )}
                </ZoomIn>
            </div>
            <div className="ml-1">
                <IonButton
                    /* eslint-disable */
                ><IonIcon icon = { sendOutline }/></IonButton>
            </div>
        </div>
        <div className="f-scroll"> 
            {/* <Viewer fileUrl={ url } plugins={ [ zoomPluginInstance ] } /> */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
                <div>
                    <Viewer
                        fileUrl={ url }
                        plugins={[
                            zoomPluginInstance,
                        ]}
                    />
                </div>
            </Worker>
        </div>
    </>
}
