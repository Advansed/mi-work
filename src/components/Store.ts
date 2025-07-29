import { combineReducers  } from 'redux'
import { useState, useEffect, useRef } from 'react'
import { Reducer } from 'react';
import { micOutline } from 'ionicons/icons';

export const reducers: Array<Reducer<any, any>> = []

export let listeners: Array<any> = []

export const i_state = {
    auth:                               false,
    login:                              { userId: "", fullName: "", role: "", token: "" },
    route:                              "",         
    back:                               0,
    message:                            '',
    toast:                              null
}

for(const [key, value] of Object.entries(i_state)){
    reducers.push(
        function (state = i_state[key], action) {
            switch(action.type){
                case key: {
                    if(typeof(value) === "object"){
                        if(Array.isArray(value)) {
                            return action.data
                        } else {
                            return action.data
                        }
                    } else return action.data
                }
                default: return state;
            }       
        }
    )
}

export async function getData(method: string, params: any) {
  const cacheKey = `${method}-${JSON.stringify(params)}`;
  
  
  const response = await fetch(URL + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const data = await response.json();
    
  return data;
}

function create_Store(reducer, initialState) {
    const currentReducer = reducer;
    let currentState = initialState;
    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            listeners.forEach((elem)=>{
                if(elem.type === action.type){
                    elem.func();
                }
            })
            return action;
        },
        subscribe(listen: any) {
            const ind = listeners.findIndex(function(b) { 
                return b.num === listen.num; 
            });
            if(ind >= 0){
                listeners[ind] = listen;
            }else{
                listeners = [...listeners, listen]
            }
        },
        unSubscribe(index) {
            const ind = listeners.findIndex(function(b) { 
                return b.num === index; 
            });
            if(ind >= 0){
                listeners.splice(ind, 1)
            }        
        }
    };
}

const reduct: any = {}

Object.keys(i_state).map((e, i)=>{ reduct[e] = reducers[i]})

const rootReducer = combineReducers( reduct )

export const Store = create_Store(rootReducer, i_state)

// useSelector hook для работы с Store
export function useSelector<T>(selector: (state: any) => T, subscriptionId: number): T {
    const [selectedState, setSelectedState] = useState<T>(selector(Store.getState()))
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        setSelectedState(selector(Store.getState()))

        // Определяем какие поля state нас интересуют для подписки
        const currentState = Store.getState()
        const selectedValue = selector(currentState)
        
        // Находим ключ в state, который соответствует нашему селектору
        const stateKey = Object.keys(currentState).find(key => 
            currentState[key] === selectedValue
        ) || 'state'

        // Подписываемся на изменения
        Store.subscribe({
            num: subscriptionId,
            type: stateKey,
            func: () => {
                if (isMountedRef.current) {
                    const newState = selector(Store.getState())
                    setSelectedState(newState)
                }
            }
        })

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            Store.unSubscribe(subscriptionId)
        }
    }, [])

    return selectedState
}

// Альтернативная версия useSelector для прямого доступа к полю
export function useStoreField<K extends keyof typeof i_state>(fieldName: K, subscriptionId: number): typeof i_state[K] {
    const [fieldValue, setFieldValue] = useState(Store.getState()[fieldName])
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        setFieldValue(Store.getState()[fieldName])

        // Подписываемся на изменения конкретного поля
        Store.subscribe({
            num: subscriptionId,
            type: fieldName as string,
            func: () => {
                if (isMountedRef.current) {
                    setFieldValue(Store.getState()[fieldName])
                }
            }
        })

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            Store.unSubscribe(subscriptionId)
        }
    }, [fieldName])

    return fieldValue
}

export const URL = "https://fhd.aostng.ru/dashboard/mi/"

export function Phone(phone): string {
    if(phone === undefined) return ""
    if(phone === null) return ""
    let str = "+"
    for(let i = 0;i < phone.length;i++){
      const ch = phone.charCodeAt(i)
      if( ch >= 48 && ch <= 57) str = str + phone.charAt(i)
    }
    return str
}

export async function exec( method, params, name ){
    const res = await getData( method,  params )
    console.log( method );
    console.log( res );
    Store.dispatch({ type: name, data: res.data})
}