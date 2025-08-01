// Оптимизированный useLics.ts
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getData, Store } from "../Store";

export interface DropdownOption {
  id: string | number;
  name: string;
  type: string;
  items: any[];
}

export interface DropdownFilterProps {
  options?: DropdownOption[];
  onSelect?: (item: DropdownOption) => void;
}

interface useLicsReturn {
    uluses: DropdownOption[]; 
    settlements: DropdownOption[]; 
    streets: DropdownOption[]; 
    houses: DropdownOption[]; 
    kv: DropdownOption[]; 
    lics: DropdownOption[]; 
    loadUluses: () => Promise<void>;
    loadSettlements: (items: any[]) => Promise<void>;
    loadStreets: (id: string) => Promise<void>;
    loadHouses: (ids: string) => Promise<void>;
    loadKv: (items: any[]) => Promise<void>;
    loadLics: (items: any[]) => Promise<void>;
    clearAll: (name: string) => Promise<void>;
    loading: boolean;
}

export const useLics = (): useLicsReturn => {
    const [state, setState] = useState<any>({
        uluses: [],
        settlements: [],
        streets: [],
        houses: [],
        kv: [],
        lics: [],
        loading: false
    });

    // Ref для отмены запросов
    const abortControllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    // Объединенный useEffect для cleanup при размонтировании
    useEffect(() => {
        mountedRef.current = true;
        
        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Оптимизированный setLoading с проверкой mounted
    const setLoadingSafe = useCallback((loading: boolean) => {
        if (mountedRef.current) {
            setState(prev => ({ ...prev, loading }));
        }
    }, []);

    // Оптимизированный setState с проверкой mounted
    const setStateSafe = useCallback((updates: Partial<typeof state>) => {
        if (mountedRef.current) {
            setState(prev => ({ ...prev, ...updates }));
        }
    }, []);

    const loadUluses = useCallback(async () => {
        // Отменяем предыдущий запрос
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        setLoadingSafe(true);
        
        try {
            const res = await getData("getSettlements", { 
                token: Store.getState().login.token 
            });
            
            if (!res.error && mountedRef.current) {
                setStateSafe({ 
                    uluses: res.data,
                    // Очищаем зависимые уровни при загрузке улусов
                    settlements: [],
                    streets: [],
                    houses: [],
                    kv: [],
                    lics: []
                });
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Load uluses error:', error);
            }
        } finally {
            setLoadingSafe(false);
        }
    }, [setLoadingSafe, setStateSafe]);

    const loadSettlements = useCallback(async (items: any[]) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        // Очищаем зависимые уровни
        setStateSafe({ 
            settlements: items,
            streets: [],
            houses: [],
            kv: [],
            lics: []
        });
    }, [setStateSafe]);
    
    const loadStreets = useCallback(async (id: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        setLoadingSafe(true);
        
        try {
            const res = await getData("getStreets", { 
                token: Store.getState().login.token, 
                s_id: id 
            });
            
            if (!res.error && mountedRef.current) {
                setStateSafe({ 
                    streets: res.data,
                    // Очищаем зависимые уровни
                    houses: [],
                    kv: [],
                    lics: []
                });
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Load streets error:', error);
            }
        } finally {
            setLoadingSafe(false);
        }
    }, [setLoadingSafe, setStateSafe]);
    
    const loadHouses = useCallback(async (ids: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        setLoadingSafe(true);
        
        try {
            const params = { 
                token: Store.getState().login.token, 
                ids: JSON.parse(ids) 
            };
            const res = await getData("getHouses", params);
            
            if (!res.error && mountedRef.current) {
                setStateSafe({ 
                    houses: res.data,
                    // Очищаем зависимые уровни
                    kv: [],
                    lics: []
                });
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Load houses error:', error);
            }
        } finally {
            setLoadingSafe(false);
        }
    }, [setLoadingSafe, setStateSafe]);
    
    const loadKv = useCallback(async (items: any[]) => {
        setStateSafe({ 
            kv: items,
            lics: [] // Очищаем лицевые счета
        });
    }, [setStateSafe]);

    const loadLics = useCallback(async (items: any[]) => {
        setStateSafe({ lics: items });
    }, [setStateSafe]);
    
    const clearAll = useCallback(async (name: string) => {
        const clearMap = {
            'ulus': { settlements: [], streets: [], houses: [], kv: [], lics: [] },
            'settle': { streets: [], houses: [], kv: [], lics: [] },
            'street': { houses: [], kv: [], lics: [] },
            'house': { kv: [], lics: [] },
            'kv': { lics: [] }
        };
        
        if (clearMap[name]) {
            setStateSafe(clearMap[name]);
        }
    }, [setStateSafe]);

    // Единственный useEffect для инициализации
    useEffect(() => {
        loadUluses();
    }, [loadUluses]);

    // Мемоизированные преобразования данных
    const namedUluses = useMemo(() => 
        state.uluses.map((ul, ind) => ({
            id: ind, 
            name: ul.ulus, 
            type: "ulus", 
            items: ul.settlements
        })), [state.uluses]
    );

    const namedSettlements = useMemo(() => 
        state.settlements.map(ul => ({
            id: ul.s_id, 
            name: ul.settlement, 
            type: "settle"
        })), [state.settlements]
    );

    const namedStreets = useMemo(() => 
        state.streets.map(ul => ({
            id: JSON.stringify(ul.ids), 
            name: ul.street, 
            type: "street"
        })), [state.streets]
    );

    const namedHouses = useMemo(() => 
        state.houses.map((ul, ind) => ({
            id: ind,
            name: ul.house,
            type: ul.lics !== undefined ? "house" : "build",
            items: ul.lics !== undefined ? ul.lics : ul.apartments
        })), [state.houses]
    );

    const namedKv = useMemo(() => 
        state.kv.map((ul, ind) => ({
            id: ind, 
            name: ul.apartment, 
            type: "kv", 
            items: ul.lics
        })), [state.kv]
    );

    const namedLics = useMemo(() => 
        state.lics.map((ul, ind) => ({
            id: ind, 
            name: ul.code, 
            type: "lics", 
            items: []
        })), [state.lics]
    );

    return {
        uluses: namedUluses,
        settlements: namedSettlements, 
        streets: namedStreets,
        houses: namedHouses,
        kv: namedKv,
        lics: namedLics,
        loadUluses,
        loadSettlements,
        loadStreets,
        loadHouses,
        loadKv,
        loadLics,
        clearAll,
        loading: state.loading
    };
};