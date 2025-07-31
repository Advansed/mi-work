// src/components/Lics/Lics.tsx
import React, { useState } from 'react';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText
} from '@ionic/react';
import { locationOutline, ellipsisHorizontal } from 'ionicons/icons';
import { useDaData } from '../dadata-component/useDaData';
import { ConfidenceLevel } from '../dadata-component/types';
import { useToast } from '../Toast/useToast';

interface LicsProps {
    initialAddress?: string;
    onAddressChange?: (address: string, isStandardized: boolean) => void;
}

export function Lics({ initialAddress = '', onAddressChange }: LicsProps) {
    const [address, setAddress] = useState<string>(initialAddress);
    const [standardizedAddress, setStandardizedAddress] = useState<string>('');
    const [isStandardized, setIsStandardized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const { standardizeAddress } = useDaData({
        apiKey:     '50bfb3453a528d091723900fdae5ca5a30369832',
        timeout:    5000
    });

    const { showSuccess, showError, showWarning } = useToast();

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (isStandardized) {
            setIsStandardized(false);
            setStandardizedAddress('');
        }
        onAddressChange?.(value, false);
    };

    const handleStandardize = async () => {
        if (!address.trim()) {
            showWarning('Введите адрес для стандартизации');
            return;
        }

        setLoading(true);
        try {
            const result = await standardizeAddress(address);
            
            if (result.success && result.data) {
                const { city, street, house, apartment } = result.data;
                const fullAddress = `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`;
                
                setStandardizedAddress(fullAddress);
                setAddress(fullAddress);
                setIsStandardized(true);
                
                // Определяем качество стандартизации
                if (result.data.confidence_level >= ConfidenceLevel.GOOD_MATCH) {
                    showSuccess('Адрес успешно стандартизирован');
                } else if (result.data.confidence_level >= ConfidenceLevel.PARTIAL_MATCH) {
                    showWarning('Адрес стандартизирован с низкой точностью');
                } else {
                    showWarning('Не удалось точно определить адрес');
                }
                
                onAddressChange?.(fullAddress, true);
            } else {
                showError(result.message || 'Не удалось стандартизировать адрес');
            }
        } catch (error) {
            console.error('Ошибка стандартизации адреса:', error);
            showError('Ошибка при стандартизации адреса');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setAddress(initialAddress);
        setStandardizedAddress('');
        setIsStandardized(false);
        onAddressChange?.(initialAddress, false);
    };

    return (
        <>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Адрес лицевого счета</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonItem lines="none">
                        <IonIcon icon={locationOutline} slot="start" />
                        <IonInput
                            value={address}
                            placeholder="Введите адрес"
                            onIonInput={(e) => handleAddressChange(e.detail.value!)}
                            disabled={loading}
                            debounce={300}
                            clearInput
                            style={isStandardized ? { fontWeight: 'bold' } : {}}
                        />
                        <IonButton
                            fill="outline"
                            slot="end"
                            onClick={handleStandardize}
                            disabled={!address.trim() || loading}
                            size="small"
                        >
                            {loading ? (
                                <IonSpinner name="crescent" />
                            ) : (
                                <IonIcon icon={ellipsisHorizontal} />
                            )}
                        </IonButton>
                    </IonItem>
                </IonCardContent>
            </IonCard>
        </>
    );
}