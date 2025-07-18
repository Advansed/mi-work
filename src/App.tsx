import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';
import LoginForm from './components/Login/LoginForm';
import { Store, useStoreField } from './components/Store';
import { getDefaultPage } from './pages/PageConfig';
import { UserRole } from './pages/pageTypes';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './App.css'

setupIonicReact();

const App: React.FC = () => {
    // Используем хук для получения состояния авторизации из Store
    const isAuthenticated = useStoreField('auth', 1);
    const loginData = useStoreField('login', 5);

    // Если пользователь не авторизован, показываем форму логина
    if (!isAuthenticated) {
        return (
            <IonApp>
                <LoginForm />
            </IonApp>
        );
    }

    // Получаем роль пользователя для определения страницы по умолчанию
    const userRole = loginData?.role as UserRole;
    console.log( userRole )
    const defaultPage = userRole ? getDefaultPage(userRole) : 'invoices';
    console.log( defaultPage )
    
    // Если пользователь авторизован, показываем основное приложение
    return (
        <IonApp>
            <IonReactRouter>
                <IonSplitPane contentId="main">
                    <Menu />
                    <IonRouterOutlet id="main">
                        {/* Главная страница - редирект на страницу по умолчанию для роли */}
                        <Route path="/" exact={true}>
                            <Redirect to={`/page/${defaultPage}`} />
                        </Route>
                        
                        {/* Страницы приложения */}
                        <Route path="/page/:name" exact={true}>
                            <Page />
                        </Route>
                        
                        {/* Fallback для старых маршрутов */}
                        <Route path="/folder/:name" exact={true}>
                            <Redirect to={`/page/${defaultPage}`} />
                        </Route>
                        
                        {/* Catch-all - редирект на страницу по умолчанию */}
                        <Route>
                            <Redirect to={`/page/${defaultPage}`} />
                        </Route>
                    </IonRouterOutlet>
                </IonSplitPane>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;