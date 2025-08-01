import { useCallback, useEffect, useMemo, useState } from "react";
import { getData, Store } from "../Store";

export interface DropdownOption {
  id: string | number;
  name: string;
}

export interface DropdownFilterProps {
  options?: DropdownOption[];
  onSelect?: (item: DropdownOption) => void;
}


interface useLicsReturn {
    ulus:       DropdownOption[]; 
    loadUlus:   () => Promise<void>;
}

export const useLics = ():useLicsReturn => {
    const [ulus, setUlus ] = useState<any>([])

    const loadUlus = useCallback(async ()=> {
        const res = await getData("getSettlements", { token: Store.getState().login.token })
        if(!res.error){
            setUlus( res.data )
        } else setUlus([])
    }, []) // Пустые зависимости, так как функция не зависит от пропсов/стейта

    useEffect(()=>{
        loadUlus()
    },[loadUlus])

 
    const namedUlus = useMemo(() => {   
        return ulus.map((ul, ind) => {
            return { id: ind, name: ul.ulus }
        });
    }, [ ulus ]);

    return {
        ulus: namedUlus,
        loadUlus
    }
}

