import { useCallback, useEffect, useMemo, useState } from "react";
import { getData, Store } from "../Store";

export interface DropdownOption {
  id:       string | number;
  name:     string;
  type:     string;
  items:    any[];
}

export interface DropdownFilterProps {
  options?: DropdownOption[];
  onSelect?: (item: DropdownOption) => void;
}


interface useLicsReturn {
    uluses:                 DropdownOption[]; 
    settlements:            DropdownOption[]; 
    streets:                DropdownOption[]; 
    houses:                 DropdownOption[]; 
    kv:                     DropdownOption[]; 
    lics:                   DropdownOption[]; 
    loadUluses:             ()          => Promise<void>;
    loadSettlements:        ( items )   => Promise<void>;
    loadStreets:            ( id )      => Promise<void>;
    loadHouses:             ( ids )     => Promise<void>;
    loadKv:                 ( items )   => Promise<void>;
    loadLics:               ( items )   => Promise<void>;
    clearAll:               ( name )    => Promise<void>;
}

export const useLics = ():useLicsReturn => {

    const [ uluses,     setUluses ]     = useState<any>([])
    const [ settle,     setSettle ]     = useState<any>([])
    const [ streets,    setStreets ]    = useState<any>([])
    const [ houses,     setHouses ]     = useState<any>([])
    const [ kv,         setKv ]         = useState<any>([])
    const [ lics,       setLics ]       = useState<any>([])

    const loadUluses        = useCallback(async ()=> {
        const res = await getData("getSettlements", { token: Store.getState().login.token })
        if(!res.error){
            setUluses( res.data )
        } 
    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта

    const loadSettlements   = useCallback(async ( items: any[])=> {
        
        setSettle( items )
        
    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта
    
    const loadStreets       = useCallback(async ( id )=> {
        
        const res = await getData("getStreets", { token: Store.getState().login.token, s_id: id } )
        console.log(res)
        if(!res.error){
            setStreets( res.data )
        } 
        
    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта
    
    const loadHouses        = useCallback(async ( ids )=> {
        const params = { token: Store.getState().login.token, ids: JSON.parse(ids) }
        console.log( params )
        const res = await getData("getHouses", params )
        console.log(res)
        if(!res.error){
            setHouses( res.data )
        } 
        
    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта
    
    const loadKv            = useCallback(async ( items )=> {
        
        setKv( items )

    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта

    const loadLics          = useCallback(async ( items )=> {
        
        setLics( items )

    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта
    
    const clearAll          = useCallback(async (name)=> {
        if(name === 'ulus') {
            setSettle([])
        }
        console.log('clear: ' + name )
    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта
 

    useEffect(()=>{
        loadUluses()
    },[loadUluses])


    const namedUluses       = useMemo(() => {   
        return uluses.map((ul, ind) => {
            return { id: ind, name: ul.ulus, type: "ulus", items: ul.settlements }
        });
    }, [ uluses ]);

    const namedSettle       = useMemo(() => {   

        return settle.map((ul) => {
            return { id: ul.s_id, name: ul.settlement, type: "settle" }
        });
    }, [ settle ]);

    const namedStreets      = useMemo(() => {   

        return streets.map((ul) => {
            return { id: JSON.stringify(ul.ids), name: ul.street, type: "street" }
        });

    }, [ streets ]);

    const namedHouses       = useMemo(() => {   

        return houses.map(( ul, ind) => {
            if(ul.lics !== undefined)
                return { id: ind, name: ul.house, type: "house", items: ul.lics }
            else 
                return { id: ind, name: ul.house, type: "build", items: ul.apartments }
        });

    }, [ houses ]);

    const namedKv           = useMemo(() => {   

        return kv.map(( ul, ind ) => {

            return { id: ind, name: ul.apartment, type: "kv", items: ul.lics }

        });

    }, [ kv ]);

    const namedLics         = useMemo(() => {   

        return lics.map(( ul, ind ) => {

            return { id: ind, name: ul.code, type: "lics", items: [] }

        });

    }, [ lics ]);

    return {

        uluses:             namedUluses,
        settlements:        namedSettle, 
        streets:            namedStreets,
        houses:             namedHouses,
        kv:                 namedKv,
        lics:               namedLics,

        loadUluses,
        loadSettlements,
        loadStreets,
        loadHouses,
        loadKv,
        loadLics,
        clearAll
    }
}

