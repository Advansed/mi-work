import React, { useEffect, useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonLoading } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useLics } from './useLics';
import './LicsForm.css'
import DropdownFilter from './components/DropDownFilter';

const LicsForm = ({ address, invoiceId, onUpdateLics, isOpen, onClose }) => {
    const { 
          uluses, settlements, streets, houses, kv, lics, loading
        , loadSettlements, loadStreets, loadHouses, loadKv, loadLics 
    } = useLics()

    const handleSelect = ( item )=>{
        switch( item.type ){
            case "ulus": 
                loadSettlements( item.items )
                console.log("select ulus: " + item.name)
                break;
            case "settle":
                console.log("select settlement: " + item.name)
                loadStreets( item.id )
                break;
            case "street":
                console.log("select street: " + item.name)
                loadHouses( item.id )
                break;
            case "house":
                console.log("select house: " + item.name + '-' + item.type )
                loadLics( item.items )
                break;
            case "build":
                console.log("select house: " + item.name + '-' + item.type )
                loadKv( item.items )
                break;
            case "kv":
                console.log("select kv: " + item.name)
                loadLics( item.items )
                break;
            case "lics":
                console.log("select lic: " + item.name)
                break;
        };
    }

    useEffect(()=>{
       // clearAll("ulus")
        console.log("useEffect lics form")
    },[])

    return (
        <>
            <IonLoading isOpen = { loading } message = "Подождите..." />
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
                <div className='ml-1 mr-1'>
                    <div>
                        <div className=' fs-09'> Улусы </div>
                        <DropdownFilter options = { uluses } onSelect = { handleSelect }/>
                    </div>
                    

                    <div className='mt-1'>
                        {
                            settlements.length > 0 
                                ? <>
                                    <div className=' fs-09'> Населенные пункты </div>
                                    <DropdownFilter options = { settlements } onSelect = { handleSelect }/>
                                </>  
                                : <></>
                        }
                    </div>
                    <div className='mt-1'>
                        {
                            streets.length > 0 
                                ? <>
                                    <div className=' fs-09'> Улица </div>
                                    <DropdownFilter options = { streets } onSelect = { handleSelect }/>
                                </>  
                                : <></>
                        }
                    </div>
                    <div className='mt-1'>
                        {
                            houses.length > 0 
                                ? <>
                                    <div className=' fs-09'> Дом </div>
                                    <DropdownFilter options = { houses } onSelect = { handleSelect }/>
                                </>  
                                : <></>
                        }
                    </div>
                    <div className='mt-1'>
                        {
                            kv.length > 0 
                                ? <>
                                    <div className=' fs-09'> Квартира </div>
                                    <DropdownFilter options = { kv } onSelect = { handleSelect }/>
                                </>  
                                : <></>
                        }
                    </div>
                    <div className='mt-1'>
                        {
                            lics.length > 0 
                                ? <>
                                    <div className=' fs-09'> Лицевой счет </div>
                                    <DropdownFilter options = { lics } onSelect = { handleSelect }/>
                                </>  
                                : <></>
                        }
                    </div>

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
        </>
    );
};

export default LicsForm;