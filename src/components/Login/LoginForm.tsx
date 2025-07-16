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
    IonCheckbox,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { eye, eyeOff, person, lockClosed, business, arrowBack } from 'ionicons/icons';
import { useLogin } from './useLogin';
import PasswordResetForm from './PasswordResetForm';
import './LoginForm.css';

const LoginForm: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const passwordInputRef = useRef<HTMLIonInputElement>(null);
    const { 
        login, 
        loading, 
        error, 
        showResetForm, 
        toggleResetForm, 
        clearError, 
        checkSavedAuth,
        validatePhone,
        validatePassword 
    } = useLogin();

    // При монтировании проверяем сохраненные данные
    useEffect(() => {
        const savedPhone = checkSavedAuth();
        if (typeof savedPhone === 'string' && savedPhone) {
            setPhone(savedPhone);
            setRememberMe(true);
        }
    }, [checkSavedAuth]);

    // Форматирование телефона при вводе
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

    // Обработка изменения телефона
    const handlePhoneChange = (value: string | null | undefined) => {
        if (value !== null && value !== undefined) {
            const formatted = formatPhoneNumber(value);
            setPhone(formatted);
            
            // Очищаем ошибку при изменении
            if (phoneError) {
                const error = validatePhone(formatted);
                setPhoneError(error || '');
            }
            if (error) clearError();
        }
    };

    // Обработка изменения пароля
    const handlePasswordChange = (value: string | null | undefined) => {
        const newPassword = value || '';
        setPassword(newPassword);
        
        // Очищаем ошибку при изменении
        if (passwordError) {
            const error = validatePassword(newPassword);
            setPasswordError(error || '');
        }
        if (error) clearError();
    };

    // Обработка отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация
        const phoneErr = validatePhone(phone);
        const passwordErr = validatePassword(password);
        
        setPhoneError(phoneErr || '');
        setPasswordError(passwordErr || '');

        if (phoneErr || passwordErr) {
            return;
        }

        const success = await login(phone, password);
        
        if (success) {
            // Сохраняем телефон если "Запомнить меня"
            if (rememberMe) {
                localStorage.setItem('rememberedPhone', phone);
            } else {
                localStorage.removeItem('rememberedPhone');
            }
        }
    };

    // Если показываем форму восстановления
    if (showResetForm) {
        return <PasswordResetForm onBack={toggleResetForm} />;
    }

    // Основная форма входа
    return (
        <IonPage className="login-page">
            <IonContent fullscreen className="login-content">
                <IonGrid className="login-grid">
                    <IonRow className="ion-justify-content-center ion-align-items-center">
                        <IonCol size="12" sizeMd="6" sizeLg="4">
                            <IonCard className="login-card">
                                <IonCardHeader className="login-header">
                                    <div className="logo-container">
                                        <IonIcon icon={business} className="login-logo" />
                                    </div>
                                    <IonCardTitle className="login-title">
                                        Мобильный сотрудник
                                    </IonCardTitle>
                                    <p className="login-subtitle">
                                        Система технического обслуживания газового оборудования
                                    </p>
                                </IonCardHeader>

                                <IonCardContent>
                                    <form onSubmit={handleSubmit} className="login-form">
                                        <IonItem 
                                            className={`login-field ${phoneError ? 'ion-invalid' : ''}`}
                                            lines="none"
                                        >
                                            <IonIcon icon={person} slot="start" />
                                            <IonInput
                                                type="tel"
                                                value={phone}
                                                placeholder="+7 (999) 123-45-67"
                                                onIonChange={e => handlePhoneChange(e.detail.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        passwordInputRef.current?.setFocus();
                                                    }
                                                }}
                                                disabled={loading}
                                                maxlength={18}
                                                required
                                            />
                                        </IonItem>
                                        {phoneError && (
                                            <IonText color="danger" className="field-error">
                                                <small>{phoneError}</small>
                                            </IonText>
                                        )}

                                        <IonItem 
                                            className={`login-field ${passwordError ? 'ion-invalid' : ''}`}
                                            lines="none"
                                        >
                                            <IonIcon icon={lockClosed} slot="start" />
                                            <IonInput
                                                ref={passwordInputRef}
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                placeholder="Пароль"
                                                onIonChange={e => handlePasswordChange(e.detail.value)}
                                                disabled={loading}
                                                required
                                            />
                                            <IonButton
                                                fill="clear"
                                                slot="end"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="password-toggle"
                                            >
                                                <IonIcon icon={showPassword ? eyeOff : eye} />
                                            </IonButton>
                                        </IonItem>
                                        {passwordError && (
                                            <IonText color="danger" className="field-error">
                                                <small>{passwordError}</small>
                                            </IonText>
                                        )}

                                        <div className="form-options">
                                            <IonItem lines="none" className="remember-me">
                                                <IonCheckbox
                                                    checked={rememberMe}
                                                    onIonChange={e => setRememberMe(e.detail.checked)}
                                                    disabled={loading}
                                                />
                                                <IonLabel className="ion-margin-start">
                                                    Запомнить меня
                                                </IonLabel>
                                            </IonItem>
                                            
                                            <a 
                                                className="forgot-password"
                                                onClick={toggleResetForm}
                                            >
                                                Забыли пароль?
                                            </a>
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
                                                    <span className="ion-margin-start">Вход...</span>
                                                </>
                                            ) : (
                                                'Войти'
                                            )}
                                        </IonButton>
                                    </form>
                                </IonCardContent>
                            </IonCard>

                            <div className="login-footer">
                                <p>АО "Сахатранснефтегаз"</p>
                                <p className="version-text">Версия 1.0.0</p>
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default LoginForm;