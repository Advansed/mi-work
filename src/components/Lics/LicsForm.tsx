import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import { DropdownFilterProps, useLics } from './useLics';

const LicsForm = ({ address, invoiceId, onUpdateLics, isOpen, onClose }) => {
    const { ulus } = useLics()

    console.log( ulus )

    const DropdownFilter: React.FC<DropdownFilterProps> = ({ options = [], onSelect }) => {
        const [value, setValue] = useState('');
        const [open, setOpen] = useState(false);
        
        const filtered = options.filter(item => 
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        return (
            <div className="dropdown-container">
            <input
                value={value}
                onChange={(e) => { setValue(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 100)}
                className="dropdown-input"
            />
            {open && (
                <div className="dropdown-list">
                {filtered.map(item => (
                    <div
                    key={item.id}
                    onClick={() => { setValue(item.name); setOpen(false); onSelect?.(item); }}
                    className="dropdown-item"
                    >
                    {item.name}
                    </div>
                ))}
                </div>
            )}
            </div>
        );
    };


  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Лицевой счет</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <div>
            
            <DropdownFilter options = { ulus } />

        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <IonButton fill="outline" onClick={onClose}>
            Отмена
          </IonButton>
          <IonButton onClick={() => onUpdateLics && onUpdateLics()}>
            Сохранить
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default LicsForm;