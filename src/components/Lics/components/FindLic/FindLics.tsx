// Оптимизированный LicsForm.tsx с корпоративными CSS классами
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonLoading } from '@ionic/react';
import { close, save } from 'ionicons/icons';
import { useLics } from './useFindLics';
import './FindLics.css';
import DropdownFilter from './DropDownFilter';

interface LicsFormProps {
    address?: string;
    invoiceId?: string;
    onSelect: ( lic: string ) => void;
    isOpen: boolean;
    onClose: () => void;
}

const FindLics: React.FC<LicsFormProps> = ({ 
    address, 
    invoiceId, 
    onSelect, 
    isOpen, 
    onClose 
}) => {
    const { 
        uluses, settlements, streets, houses, kv, lics, loading,
        loadSettlements, loadStreets, loadHouses, loadKv, loadLics 
    } = useLics();

    const [ info,   setInfo ] = useState('')
    const [ lic,    setLic  ] = useState('')

    // Оптимизированный handleSelect с useCallback
    const handleSelect = useCallback((item: any) => {
        switch (item.type) {
            case "ulus": 
                setInfo( item.name )
                loadSettlements(item.items);
                break;
            case "settle":
                console.log( info )
                console.log( item.name )
                setInfo( info + ' → ' + item.name )
                loadStreets(item.id);
                break;
            case "street":
                setInfo( info + ' → ' + item.name )
                loadHouses(item.id);
                break;
            case "house":
                setInfo( info + ' → ' + item.name )
                loadLics(item.items);
                break;
            case "build":
                setInfo( info + ' → ' + item.name )
                loadKv(item.items);
                break;
            case "kv":
                setInfo( info + ' → ' + item.name )
                loadLics(item.items);
                break;
            case "lics":
                onSelect( item.name )
                console.log( 'lics -' + item.name )
                break;
        }
    }, [loadSettlements, loadStreets, loadHouses, loadKv, loadLics, info, lic]);

    // Мемоизированная конфигурация уровней - один useEffect вместо множественных
    const levelConfig = useMemo(() => {
        const config: any = [];

        // Улусы всегда показываем первыми
        if (uluses.length > 0) {
            config.length = 0;
            config.push({
                type: 'ulus',
                label: 'Улус',
                render: () => <DropdownFilter options={uluses} onSelect={handleSelect} />
            });
        }

        // Поселения
        if (settlements.length > 0) {
            config.length = 0;
            config.push({
                type: 'settle',
                label: 'Населенный пункт',
                render: () => <DropdownFilter options={settlements} onSelect={handleSelect} />
            });
        }

        // Улицы
        if (streets.length > 0) {
            config.length = 0;
            config.push({
                type: 'street',
                label: 'Улица',
                render: () => <DropdownFilter options={streets} onSelect={handleSelect} />
            });
        }

        // Дома
        if (houses.length > 0) {
            config.length = 0;
            config.push({
                type: 'house',
                label: 'Дом',
                render: () => <DropdownFilter options={houses} onSelect={handleSelect} />
            });
        }

        // Квартиры
        if (kv.length > 0) {
            config.length = 0;
            config.push({
                type: 'kv',
                label: 'Квартира',
                render: () => <DropdownFilter options={kv} onSelect={handleSelect} />
            });
        }

        // Лицевые счета
        if (lics.length > 0) {
            config.length = 0;
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
        console.log("save - " + lic )
        if (onSelect) {
            onSelect( lic );
        }
    }, [onSelect]);

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
                    <div className="flex fl-space pb-1 corporate-info-section">
                        { info }
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

export default React.memo( FindLics );