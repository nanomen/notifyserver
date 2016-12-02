/**
 *
 * Регистрация id браузера для уведомлений
 *
 */

class Notify {

    // Контсуктор модуля
    constructor() {

        // Путь до сервиса воркера
        this._SERVICE_WORKER_URI = 'notify-sw.js',

        // Путь до сервера подписки браузера
        this._SUBS_API = 'PATH_TO_API/get_data?recipient=',

        // Предоставляем метод готовности модуля
        this.ready = this.checkToNotify();

    }

    /**
     * Подписываем браузер на нотификацию
     */
    checkToNotify() {

        // Проверка прав на нотификацию
        return new Promise((resolve, reject) => {

            // Если нотификации не поддерживаются
            if (typeof Notification === 'undefined') {

                // Отклонено
                return reject({msg: 'Нотификации не поддерживаются'});

            }

            // Если отправка нотификаций заблокирована
            if (Notification.permission === 'denied') {

                // Отклонено
                return reject({msg: 'Отправка нотификаций заблокирована'});

            }

            // Если отправка нотификаций разрешена
            if (Notification.permission === 'granted') {

                // Разрешено
                return resolve({msg: 'Отправка нотификаций разрешена'});

            }

            // Если еще уведомления не подтверждали
            if (Notification.permission === 'default') {

                Notification.requestPermission(result => {

                    // Если отправку так и не разрешили
                    if (result !== 'granted') {

                        // Отклоняем
                        reject({msg: 'Отправка нотификаций заблокирована'});

                    }

                    // Если разрешили, то отправляем успех
                    resolve({msg: 'Отправка нотификаций разрешена'});

                });
            }

        });

    }

    /**
     * Регистрируем сервис воркера
     */
    registerServiceWorker() {

        var

            // Путь до воркера
            serviceWorkerURI = this._SERVICE_WORKER_URI,

            // Конфигурация воркера
            serviceWorkerConfig = {};

        // Проверка на поддержку воркера
        if ('serviceWorker' in navigator) {

            console.info('Service Worker поддерживается');

            // Регистрируем url сервис воркера
            // Тем самым связывая браузер с воркером
            // Возвращает промис
            navigator
                .serviceWorker
                .register(serviceWorkerURI, serviceWorkerConfig)

                    // Воркер успешно зарегистрирован
                    // В аргументах - объект регистрации воркера
                    .then(serviceWorkerRegistration => {

                        console.info('Service Worker зарегистрирован');

                        // Мы успешно зарегестрировались
                        // значит можем подписать клиента на уведомления
                        this.subscribeClient();

                    })

                    // Не получилось зарегистрировать воркер
                    .catch(err => console.error('ServiceWorker не зарегистрирован'));

        } else {

            console.info('Service Worker не поддерживается. Работаем по принципу арахиса');

        }

    }

    /**
     * Подписываем клиента на уведомления
     */
    subscribeClient() {

        // Подключаем управление подпиской через воркер
        return navigator.serviceWorker.ready

            // Если у нас есть доступ, подписываемся
            .then(serviceWorkerRegistration => {

                // Возвращаем промис объекта подписки воркера
                return serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true
                });

            })

            // Подписаны на обновления
            .then(subscription => {

                console.log('Подписаться на уведомления получилось');

                // Запускаем подписку
                this.subscriptionUpdate(subscription);

            })

            // Подписаться на уведомления не получилось
            .catch(() => console.log('Подписаться на уведомления не получилось'));

    }

    /**
     * Обновление подписки
     */

    subscriptionUpdate(_subscription) {

        var

            subscriptionAPI = this._SUBS_API,

            // Получаем объект подписки
            subscription = JSON.parse(JSON.stringify(_subscription));

        if (
            subscription &&
            subscription.keys &&
            subscription.keys.auth &&
            subscription.keys.p256dh) {

            // Регистрируем пользователя у себя в базе
            // subscription.endpoint - ID браузера
            fetch(`${subscriptionAPI}${subscription.endpoint}`)
                .catch(err => console.error('Ошибка регистрации пользователя', err));

        } else {

          console.error('Некорректный объект для сервиса уведомлений', subscription);

        }

    }

}

// Share As Global
if (window) {
    window.Notify = Notify;
}