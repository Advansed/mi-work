import React, { useState, useRef, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar
} from '@ionic/react';
import { 
    arrowBack, 
    checkmarkCircle, 
    phonePortrait, 
    keypad, 
    lockClosed,
    refreshCircle 
} from 'ionicons/icons';
import { usePasswordReset, ResetStep } from './usePasswordReset';
import './LoginForm.css';

interface PasswordResetFormProps {
    onBack: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBack }) => {
    const {
        currentStep,
        loading,
        error,
        timer,
        canResend,
        sendSMS,
        verifySMS,
        setNewPassword,
        resendSMS,
        goBack,
        clearError,
        getMaskedPhone,
        getPasswordStrength,
        validatePassword
    } = usePasswordReset();

    // Состояния для формы
    const [phone, setPhone] = useState('');
    const [smsCode, setSmsCode] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    // Рефы для СМС полей
    const smsRefs = useRef<(HTMLIonInputElement | null)[]>([]);

    // Форматирование телефона
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;
        
        if (cleaned.length >= 1) {
            if (cleaned[0] === '7' || cleaned[0] === '8') {
                formatted = '+7';
                if (cleaned.length > 1) {
                    formatted += ' (' + cleaned.substring(1, 4);
                }
                if (cleaned.length > 4) {
                    formatted += ') ' + cleaned.substring(4, 7);
                }
                if (cleaned.length > 7) {
                    formatted += '-' + cleaned.substring(7, 9);
                }
                if (cleaned.length > 9) {
                    formatted += '-' + cleaned.substring(9, 11);
                }
            }
        }
        
        return formatted;
    };

    // Обработка ввода телефона
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (await sendSMS(phone)) {
            setSmsCode(['', '', '', '', '', '']);
            setTimeout(() => smsRefs.current[0]?.setFocus(), 300);
        }
    };

    // Обработка ввода СМС кода
    const handleSmsChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Если вставили несколько цифр
            const digits = value.replace(/\D/g, '').split('');
            const newCode = [...smsCode];
            
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit;
                }
            });
            
            setSmsCode(newCode);
            
            // Фокус на следующее пустое поле
            const nextEmpty = newCode.findIndex((v, i) => i >= index && !v);
            if (nextEmpty !== -1 && smsRefs.current[nextEmpty]) {
                smsRefs.current[nextEmpty]?.setFocus();
            } else if (newCode.every(v => v)) {
                // Если все поля заполнены, проверяем код
                handleSmsSubmit(newCode.join(''));
            }
        } else {
            const newCode = [...smsCode];
            newCode[index] = value.replace(/\D/g, '');
            setSmsCode(newCode);
            
            // Автопереход на следующее поле
            if (value && index < 5) {
                smsRefs.current[index + 1]?.setFocus();
            }
            
            // Если заполнены все поля
            if (index === 5 && value && newCode.every(v => v)) {
                handleSmsSubmit(newCode.join(''));
            }
        }
        
        clearError();
    };

    // Обработка backspace в СМС полях
    const handleSmsKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
            smsRefs.current[index - 1]?.setFocus();
        }
    };

    // Отправка СМС кода
    const handleSmsSubmit = async (code?: string) => {
        const fullCode = code || smsCode.join('');
        if (fullCode.length === 6) {
            await verifySMS(fullCode);
        }
    };

    // Обработка установки пароля
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Локальная валидация
        const errors: Record<string, string> = {};
        
        const passwordError = validatePassword(password);
        if (passwordError) {
            errors.password = passwordError;
        }
        
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }
        
        setLocalErrors(errors);
        
        if (Object.keys(errors).length === 0) {
            await setNewPassword(password, confirmPassword);
        }
    };

    // Форматирование таймера
    const formatTimer = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Рендер в зависимости от шага
    const renderStep = () => {
        switch (currentStep) {
            case ResetStep.PHONE_INPUT:
                return (
                    <form onSubmit={handlePhoneSubmit}>
                        <div className="step-icon">
                            <IonIcon icon={phonePortrait} />
                        </div>
                        <h2>Восстановление пароля</h2>
                        <p className="step-description">
                            Введите номер телефона, указанный при регистрации
                        </p>
                        
                        <IonItem className="login-field" lines="none">
                            <IonIcon icon={phonePortrait} slot="start" />
                            <IonInput
                                type="tel"
                                value={phone}
                                placeholder="+7 (999) 123-45-67"
                                onIonChange={e => setPhone(formatPhoneNumber(e.detail.value || ''))}
                                disabled={loading}
                                maxlength={18}
                                autofocus
                                required
                            />
                        </IonItem>

                        {error && (
                            <IonText color="danger" className="login-error">
                                <p>{error}</p>
                            </IonText>
                        )}

                        <IonButton
                            expand="block"
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span className="ion-margin-start">Отправка...</span>
                                </>
                            ) : (
                                'Получить код'
                            )}
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="clear"
                            onClick={onBack}
                            className="back-button"
                        >
                            <IonIcon icon={arrowBack} slot="start" />
                            Вернуться к входу
                        </IonButton>
                    </form>
                );

            case ResetStep.SMS_CODE:
                return (
                    <div>
                        <div className="step-icon">
                            <IonIcon icon={keypad} />
                        </div>
                        <h2>Введите код из СМС</h2>
                        <p className="step-description">
                            Код отправлен на номер<br />
                            <strong>{getMaskedPhone()}</strong>
                        </p>

                        <div className="sms-code-inputs">
                            {smsCode.map((digit, index) => (
                                <IonInput
                                    key={index}
                                    ref={(el: HTMLIonInputElement | null) => {
                                        if (smsRefs.current) {
                                            smsRefs.current[index] = el;
                                        }
                                    }}
                                    type="tel"
                                    inputmode="numeric"
                                    maxlength={1}
                                    value={digit}
                                    className="sms-code-input"
                                    onIonChange={e => handleSmsChange(index, e.detail.value || '')}
                                    onKeyDown={e => handleSmsKeyDown(index, e as any)}
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {timer > 0 && (
                            <div className="sms-timer">
                                Повторная отправка через {formatTimer()}
                            </div>
                        )}

                        {error && (
                            <IonText color="danger" className="login-error">
                                <p>{error}</p>
                            </IonText>
                        )}

                        <IonButton
                            expand="block"
                            disabled={!canResend || loading}
                            onClick={() => resendSMS()}
                            className="login-button"
                        >
                            {loading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span className="ion-margin-start">Отправка...</span>
                                </>
                            ) : (
                                <>
                                    <IonIcon icon={refreshCircle} slot="start" />
                                    Отправить код повторно
                                </>
                            )}
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="clear"
                            onClick={goBack}
                            className="back-button"
                        >
                            <IonIcon icon={arrowBack} slot="start" />
                            Изменить номер
                        </IonButton>
                    </div>
                );

            case ResetStep.NEW_PASSWORD:
                const strength = getPasswordStrength(password);
                
                return (
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="step-icon">
                            <IonIcon icon={lockClosed} />
                        </div>
                        <h2>Новый пароль</h2>
                        <p className="step-description">
                            Придумайте новый пароль для входа в систему
                        </p>

                        <IonItem className={`login-field ${localErrors.password ? 'ion-invalid' : ''}`} lines="none">
                            <IonIcon icon={lockClosed} slot="start" />
                            <IonInput
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                placeholder="Новый пароль"
                                onIonChange={e => {
                                    setPassword(e.detail.value || '');
                                    setLocalErrors({});
                                }}
                                disabled={loading}
                                required
                            />
                            <IonButton
                                fill="clear"
                                slot="end"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                            >
                                <IonIcon icon={showPassword ? 'eye-off' : 'eye'} />
                            </IonButton>
                        </IonItem>
                        
                        {password && (
                            <div className="password-strength-container">
                                <div className={`password-strength strength-${strength}`}></div>
                                <span className="strength-text">
                                    {strength === 'weak' && 'Слабый'}
                                    {strength === 'medium' && 'Средний'}
                                    {strength === 'strong' && 'Надежный'}
                                </span>
                            </div>
                        )}
                        
                        {localErrors.password && (
                            <IonText color="danger" className="field-error">
                                <small>{localErrors.password}</small>
                            </IonText>
                        )}

                        <IonItem className={`login-field ${localErrors.confirmPassword ? 'ion-invalid' : ''}`} lines="none">
                            <IonIcon icon={lockClosed} slot="start" />
                            <IonInput
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                placeholder="Повторите пароль"
                                onIonChange={e => {
                                    setConfirmPassword(e.detail.value || '');
                                    setLocalErrors({});
                                }}
                                disabled={loading}
                                required
                            />
                        </IonItem>
                        {localErrors.confirmPassword && (
                            <IonText color="danger" className="field-error">
                                <small>{localErrors.confirmPassword}</small>
                            </IonText>
                        )}

                        <div className="password-requirements">
                            <p>Требования к паролю:</p>
                            <ul>
                                <li className={password.length >= 6 ? 'valid' : ''}>
                                    Минимум 6 символов
                                </li>
                                <li className={/\d/.test(password) ? 'valid' : ''}>
                                    Хотя бы одна цифра
                                </li>
                            </ul>
                        </div>

                        {error && (
                            <IonText color="danger" className="login-error">
                                <p>{error}</p>
                            </IonText>
                        )}

                        <IonButton
                            expand="block"
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span className="ion-margin-start">Сохранение...</span>
                                </>
                            ) : (
                                'Сохранить пароль'
                            )}
                        </IonButton>
                    </form>
                );

            case ResetStep.SUCCESS:
                return (
                    <div className="success-screen">
                        <div className="success-icon">
                            <IonIcon icon={checkmarkCircle} color="success" />
                        </div>
                        <h2>Пароль успешно изменен!</h2>
                        <p>Сейчас вы будете перенаправлены на страницу входа</p>
                        <IonSpinner name="crescent" />
                    </div>
                );
        }
    };

    return (
        <IonPage className="login-page">
            <IonContent fullscreen className="login-content">
                <IonGrid className="login-grid">
                    <IonRow className="ion-justify-content-center ion-align-items-center">
                        <IonCol size="12" sizeMd="6" sizeLg="4">
                            <IonCard className="login-card reset-card">
                                <IonCardContent>
                                    {renderStep()}
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default PasswordResetForm;