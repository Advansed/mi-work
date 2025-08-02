// Оптимизированный LicsForm.tsx с корпоративными CSS классами
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonLoading } from '@ionic/react';
import { close, save } from 'ionicons/icons';
import { useLics } from './useLics';
import './LicsForm.css';
import DropdownFilter from './components/DropDownFilter';

interface LicsFormProps {
    address: string;
    invoiceId: string;
    onUpdateLics: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const LicsForm: React.FC<LicsFormProps> = ({ 
    address, 
    invoiceId, 
    onUpdateLics, 
    isOpen, 
    onClose 
}) => {
    const { 
        uluses, settlements, streets, houses, kv, lics, loading,
        loadSettlements, loadStreets, loadHouses, loadKv, loadLics 
    } = useLics();

    // Оптимизированный handleSelect с useCallback
    const handleSelect = useCallback((item: any) => {
        switch (item.type) {
            case "ulus": 
                loadSettlements(item.items);
                break;
            case "settle":
                loadStreets(item.id);
                break;
            case "street":
                loadHouses(item.id);
                break;
            case "house":
                loadLics(item.items);
                break;
            case "build":
                loadKv(item.items);
                break;
            case "kv":
                loadLics(item.items);
                break;
            case "lics":
                // Выбран лицевой счет
                break;
        }
    }, [loadSettlements, loadStreets, loadHouses, loadKv, loadLics]);

    // Мемоизированная конфигурация уровней - один useEffect вместо множественных
    const levelConfig = useMemo(() => {
        const config: any = [];

        // Улусы всегда показываем первыми
        if (uluses.length > 0) {
            config.push({
                type: 'ulus',
                label: 'Улус',
                render: () => <DropdownFilter options={uluses} onSelect={handleSelect} />
            });
        }

        // Поселения
        if (settlements.length > 0) {
            config.push({
                type: 'settle',
                label: 'Населенный пункт',
                render: () => <DropdownFilter options={settlements} onSelect={handleSelect} />
            });
        }

        // Улицы
        if (streets.length > 0) {
            config.push({
                type: 'street',
                label: 'Улица',
                render: () => <DropdownFilter options={streets} onSelect={handleSelect} />
            });
        }

        // Дома
        if (houses.length > 0) {
            config.push({
                type: 'house',
                label: 'Дом',
                render: () => <DropdownFilter options={houses} onSelect={handleSelect} />
            });
        }

        // Квартиры
        if (kv.length > 0) {
            config.push({
                type: 'kv',
                label: 'Квартира',
                render: () => <DropdownFilter options={kv} onSelect={handleSelect} />
            });
        }

        // Лицевые счета
        if (lics.length > 0) {
            config.push({
                type: 'lics',
                label: 'Лицевой счет',
                render: () => <DropdownFilter options={lics} onSelect={handleSelect} />
            });
        }

        return config;
    }, [uluses, settlements, streets, houses, kv, lics, handleSelect]);

    // Мемоизированные обработчики событий
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleSave = useCallback(() => {
        if (onUpdateLics) {
            onUpdateLics();
        }
    }, [onUpdateLics]);

    return (
        <>
            <IonLoading isOpen={loading} />
            <IonModal 
                isOpen={isOpen} 
                onDidDismiss={handleClose}
                className="lics-form-modal"
            >
                <IonHeader className="page-header">
                    <IonToolbar>
                        <IonTitle>Поиск лицевого счета</IonTitle>
                        <IonButtons slot="end">
                            <IonButton 
                                fill="clear" 
                                onClick={handleSave}
                                className="close-button"
                            >
                                <IonIcon icon = { save } />
                            </IonButton>
                            <IonButton 
                                fill="clear" 
                                onClick={handleClose}
                                className="close-button"
                            >
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                
                <IonContent className="ion-padding">
                    <div className="flex fl-space">
                        <div></div>
                        <div className='flex'>

                        </div>
                    </div>
                    <div className="space-y-4">
                        {levelConfig.map((config, index) => (
                            <div 
                                key={`${config.type}-${index}`} 
                                className="lics-level-container"
                            >
                                <label className="lics-level-label">
                                    {config.label}
                                </label>
                                {config.render()}
                            </div>
                        ))}
                    </div>
                    
                </IonContent>
            </IonModal>
        </>
    );
};

export default React.memo(LicsForm);