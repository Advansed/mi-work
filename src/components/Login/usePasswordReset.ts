import { useState, useCallback, useEffect } from 'react';
import { getData, Phone } from '../../components/Store';

// Этапы восстановления
export enum ResetStep {
    PHONE_INPUT = 'phone',
    SMS_CODE = 'sms',
    NEW_PASSWORD = 'password',
    SUCCESS = 'success'
}

// Интерфейсы
interface SendSmsResponse {
    Код: number;
    message?: string;
    data?: {
        sessionId: string;
    };
}

interface VerifySmsResponse {
    Код: number;
    message?: string;
    data?: {
        isValid: boolean;
    };
}

interface ResetPasswordResponse {
    Код: number;
    message?: string;
}

export const usePasswordReset = () => {
    const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.PHONE_INPUT);
    const [phone, setPhone] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // Таймер обратного отсчета
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timer]);

    // Запуск таймера
    const startTimer = useCallback(() => {
        setTimer(60); // 60 секунд
        setCanResend(false);
    }, []);

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

    // Валидация СМС кода
    const validateSmsCode = (code: string): string | null => {
        if (!code || code.length !== 6) {
            return 'Введите 6-значный код';
        }
        
        if (!/^\d{6}$/.test(code)) {
            return 'Код должен содержать только цифры';
        }
        
        return null;
    };

    // Валидация пароля
    const validatePassword = (password: string): string | null => {
        if (!password) {
            return 'Введите пароль';
        }
        
        if (password.length < 6) {
            return 'Пароль должен быть не менее 6 символов';
        }
        
        if (!/\d/.test(password)) {
            return 'Пароль должен содержать хотя бы одну цифру';
        }
        
        return null;
    };

    // Проверка силы пароля
    const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
        if (!password || password.length < 6) return 'weak';
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength >= 3) return 'strong';
        if (strength >= 2) return 'medium';
        return 'weak';
    };

    // Отправка СМС
    const sendSMS = useCallback(async (phoneNumber: string): Promise<boolean> => {
        const phoneError = validatePhone(phoneNumber);
        if (phoneError) {
            setError(phoneError);
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const formattedPhone = Phone(phoneNumber);
            
            const response = await getData('SEND_SMS', {
                phone: formattedPhone
            }) as SendSmsResponse;

            if (response.Код === 200 && response.data) {
                setPhone(formattedPhone);
                setSessionId(response.data.sessionId);
                setCurrentStep(ResetStep.SMS_CODE);
                startTimer();
                return true;
            } else {
                setError(response.message || 'Ошибка отправки СМС');
                return false;
            }
        } catch (err) {
            console.error('Send SMS error:', err);
            setError('Ошибка соединения. Попробуйте позже.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [startTimer]);

    // Проверка СМС кода
    const verifySMS = useCallback(async (code: string): Promise<boolean> => {
        const codeError = validateSmsCode(code);
        if (codeError) {
            setError(codeError);
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getData('VERIFY_SMS', {
                phone: phone,
                code: code,
                sessionId: sessionId
            }) as VerifySmsResponse;

            if (response.Код === 200 && response.data?.isValid) {
                setSmsCode(code);
                setCurrentStep(ResetStep.NEW_PASSWORD);
                return true;
            } else {
                setError('Неверный код подтверждения');
                return false;
            }
        } catch (err) {
            console.error('Verify SMS error:', err);
            setError('Ошибка проверки кода');
            return false;
        } finally {
            setLoading(false);
        }
    }, [phone, sessionId]);

    // Установка нового пароля
    const setNewPassword = useCallback(async (password: string, confirmPassword: string): Promise<boolean> => {
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return false;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getData('RESET_PASSWORD', {
                phone: phone,
                code: smsCode,
                newPassword: password,
                sessionId: sessionId
            }) as ResetPasswordResponse;

            if (response.Код === 200) {
                setCurrentStep(ResetStep.SUCCESS);
                // Очистка через 3 секунды
                setTimeout(() => {
                    reset();
                }, 3000);
                return true;
            } else {
                setError(response.message || 'Ошибка установки пароля');
                return false;
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setError('Ошибка соединения');
            return false;
        } finally {
            setLoading(false);
        }
    }, [phone, smsCode, sessionId]);

    // Повторная отправка СМС
    const resendSMS = useCallback(async (): Promise<boolean> => {
        if (!canResend) return false;
        
        return sendSMS(phone);
    }, [canResend, phone, sendSMS]);

    // Сброс формы
    const reset = useCallback(() => {
        setCurrentStep(ResetStep.PHONE_INPUT);
        setPhone('');
        setSmsCode('');
        setSessionId('');
        setError(null);
        setTimer(0);
        setCanResend(false);
    }, []);

    // Переход назад
    const goBack = useCallback(() => {
        if (currentStep === ResetStep.SMS_CODE) {
            setCurrentStep(ResetStep.PHONE_INPUT);
            setSmsCode('');
        } else if (currentStep === ResetStep.NEW_PASSWORD) {
            setCurrentStep(ResetStep.SMS_CODE);
        }
        setError(null);
    }, [currentStep]);

    // Форматирование телефона для отображения
    const getMaskedPhone = useCallback(() => {
        if (!phone) return '';
        
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
        
        if (match) {
            return `+${match[1]} ${match[2]} ***-**-${match[5]}`;
        }
        
        return phone;
    }, [phone]);

    return {
        currentStep,
        phone,
        smsCode,
        loading,
        error,
        timer,
        canResend,
        sendSMS,
        verifySMS,
        setNewPassword,
        resendSMS,
        reset,
        goBack,
        clearError: () => setError(null),
        getMaskedPhone,
        getPasswordStrength,
        validatePassword
    };
};