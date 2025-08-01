import React, { useEffect, useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useLics } from './useLics';
import './LicsForm.css'
import DropdownFilter from './components/DropDownFilter';

const LicsForm = ({ address, invoiceId, onUpdateLics, isOpen, onClose }) => {
    const [ info, setInfo ] = useState<any>([])
    const { 
          uluses, settlements, streets, houses, kv, lics
        , loadSettlements, loadStreets, loadHouses, loadKv, loadLics 
    } = useLics()

    const handleSelect1 = ( item )=>{
        setInfo( [ item ] )
        loadSettlements( item.items )
        console.log("select ulus: " + item.name)
    }
    const handleSelect2 = ( item )=>{
        setInfo( [ ...info, item ] )
        console.log("select settlement: " + item.name)
        loadStreets( item.id )
    }
    const handleSelect3 = ( item )=>{
        setInfo( [ ...info, item ] )
        console.log("select street: " + item.name)
        loadHouses( item.id )
    }
    const handleSelect4 = ( item )=>{
        setInfo( [ ...info, item ] )
        console.log("select house: " + item.name + '-' + item.type )
        if(item.type === 'house')
            loadLics( item.items )
        else 
            loadKv( item.items )
    }
    const handleSelect5 = ( item )=>{
        setInfo( [ ...info, item ] )
        console.log("select kv: " + item.name)
        loadLics( item.items )
        
    }
    const handleSelect6 = ( item )=>{
        setInfo( [ ...info, item ] )
        console.log("select lic: " + item.name)
        
    }

    useEffect(()=>{
       // clearAll("ulus")
        console.log("useEffect lics form")
    },[])

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
            <div className='ml-1 mr-1'>
                <div>
                    <div className=' fs-09'> Улусы </div>
                    <DropdownFilter options = { uluses } onSelect = { handleSelect1 }/>
                </div>
                

                <div className='mt-1'>
                    {
                        settlements.length > 0 
                            ? <>
                                <div className=' fs-09'> Населенные пункты </div>
                                <DropdownFilter options = { settlements } onSelect = { handleSelect2 }/>
                            </>  
                            : <></>
                    }
                </div>
                <div className='mt-1'>
                    {
                        streets.length > 0 
                            ? <>
                                <div className=' fs-09'> Улица </div>
                                <DropdownFilter options = { streets } onSelect = { handleSelect3 }/>
                            </>  
                            : <></>
                    }
                </div>
                <div className='mt-1'>
                    {
                        houses.length > 0 
                            ? <>
                                <div className=' fs-09'> Дом </div>
                                <DropdownFilter options = { houses } onSelect = { handleSelect4 }/>
                            </>  
                            : <></>
                    }
                </div>
                <div className='mt-1'>
                    {
                        kv.length > 0 
                            ? <>
                                <div className=' fs-09'> Квартира </div>
                                <DropdownFilter options = { kv } onSelect = { handleSelect5 }/>
                            </>  
                            : <></>
                    }
                </div>
                <div className='mt-1'>
                    {
                        lics.length > 0 
                            ? <>
                                <div className=' fs-09'> Лицевой счет </div>
                                <DropdownFilter options = { lics } onSelect = { handleSelect6 }/>
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
    );
};

export default LicsForm;