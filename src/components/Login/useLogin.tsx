import { useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import { Store, getData, Phone } from '../../components/Store';

// Интерфейсы
interface LoginRequest {
    phone: string;
    password: string;
}

interface LoginResponse {
    Код: number;
    data?: {
        id: string;
        fullName: string;
        role: string;
        phone: string;
        token?: string;
    };
    message?: string;
}

interface LoginData {
    userId: string;
    fullName: string;
    role: string;
    token: string;
}

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResetForm, setShowResetForm] = useState(false);
    const history = useHistory();

    // Валидация телефона
    const validatePhone = (phone: string): string | null => {
        if (!phone) {
            return 'Введите номер телефона';
        }
        
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 11) {
            return 'Неверный формат телефона';
        }
        
        return null;
    };

    // Валидация пароля
    const validatePassword = (password: string): string | null => {
        if (!password) {
            return 'Введите пароль';
        }
        
        if (password.length < 4) {
            return 'Пароль должен быть не менее 4 символов';
        }
        
        return null;
    };

    // Основная функция авторизации
    const login = useCallback(async (phone: string, password: string): Promise<boolean> => {
        // Валидация
        const phoneError = validatePhone(phone);
        if (phoneError) {
            setError(phoneError);
            return false;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            // Форматируем телефон
            const formattedPhone = Phone(phone);
            
            const response = await getData('AUTHORIZATION', {
                Логин: formattedPhone,
                Пинкод: password
            }) as LoginResponse;

            if (response.Код === 200 && response.data) {
                // Формируем объект login
                const loginData: LoginData = {
                    userId: response.data.id,
                    fullName: response.data.fullName,
                    role: response.data.role,
                    token: response.data.token || ''
                };

                // Сохраняем в Store
                Store.dispatch({ type: 'auth', data: true });
                Store.dispatch({ type: 'login', data: loginData });

                // Сохраняем в localStorage
                localStorage.setItem('auth', 'true');
                localStorage.setItem('loginData', JSON.stringify(loginData));
                localStorage.setItem('userPhone', formattedPhone);

                // Редирект по ролям
                const roleRoutes: Record<string, string> = {
                    'master': '/master/dashboard',
                    'technician': '/technician/dashboard',
                    'plumber': '/plumber/dashboard',
                    'dispatcher': '/dispatcher/dashboard',
                    'subcontractor': '/subcontractor/dashboard'
                };

                const route = roleRoutes[response.data.role] || '/dashboard';
                history.push(route);

                return true;
            } else {
                setError(response.message || 'Неверный логин или пароль');
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Ошибка соединения. Попробуйте позже.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [history]);

    // Переключение на форму восстановления
    const toggleResetForm = useCallback(() => {
        setShowResetForm(!showResetForm);
        setError(null);
    }, [showResetForm]);

    // Очистка ошибок
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Проверка сохраненной авторизации
    const checkSavedAuth = useCallback(() => {
        const savedAuth = localStorage.getItem('auth') === 'true';
        const savedPhone = localStorage.getItem('rememberedPhone');
        
        if (savedAuth) {
            const loginDataStr = localStorage.getItem('loginData');
            if (loginDataStr) {
                try {
                    const loginData = JSON.parse(loginDataStr);
                    Store.dispatch({ type: 'auth', data: true });
                    Store.dispatch({ type: 'login', data: loginData });
                    return true;
                } catch (e) {
                    console.error('Error parsing saved login data:', e);
                }
            }
        }
        
        return savedPhone || null;
    }, []);

    return {
        login,
        loading,
        error,
        showResetForm,
        toggleResetForm,
        clearError,
        checkSavedAuth,
        validatePhone,
        validatePassword
    };
};