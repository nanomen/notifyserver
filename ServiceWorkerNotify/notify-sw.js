const

    // Префикс для сообщений воркера
    swPrefix = 'Service Worker:',

    // Путь до иконки нотификации
    NOTIFY_ICON = 'PATH_TO_LOGO';

/**
 * События
 */

// Событие отправки уведомления
self.addEventListener('push', onPush);

// Событие клика по уведомлению
self.addEventListener('notificationclick', onNotifyClick);

// Событие закрытия уведомления
self.addEventListener('notificationclose', onNotifyClose);

/**
 * Методы
 */

// Метод по событию отправки уведомления
function onPush(e) {

    console.log(`${swPrefix} забираем свежее уведомление с сервера`);

    var

        // Путь для забора нотификации,
        // с рандомным числом против кеширования
        notifyURI = 'notify.json?cache='+ Math.random().toFixed(5)*100000;

    // Отправляем запрос и ждем,
    // пока не придет ответ
    e.waitUntil(

        // Отправляем запрос
        fetch(notifyURI)
            .then(response => {

                if (response.status !== 200) {

                    console.log(`${swPrefix}Ошибка получения данных: ${response.status}`);

                    throw new Error();

                }

                // Если данные получены,
                // разбираем полученные данные
                return response.json()

                    .then(data => {

                        var

                            // Заголовок сообщения
                            title = null,

                            // Тело сообщения
                            body = null,

                            // Иконка сообщения
                            icon = NOTIFY_ICON,

                            // Ссылка сообщения
                            url = null;

                        // Если ответ с ошибкой или невалидные данные
                        if (data.error || !data.notification) {

                            console.error(`${swPrefix}Ошибка в разборе полученных данных`, data.error);
                            throw new Error();

                        }

                        // Если ошибок не было, то заполняем данными
                        title = data.notification.title;
                        body = data.notification.body;
                        url = data.notification.url;

                        // Отправляем уведомление
                        // через сервис уведомлений
                        return self.registration.showNotification(title, {
                            body: body,
                            icon: icon,
                            data: {
                                url: url
                            }
                        });

                    })

                    // Если при получении и обработке данных возникла ошибка
                    .catch(err => console.error(`${swPrefix}Ошибка разбора полученных данных`, err));

            })

    );

};

// Метод по событию клика на уведомление
function onNotifyClick(e) {

    var

        // Ссылка с нотификации
        url = null;

    // Закрываем уведомление
    e.notification.close();

    // Если в уведомлении есть дополнительные данные
    // и в них есть ссылка, то переходим по ней
    if (e.notification.data && e.notification.data.url) {

        url = e.notification.data.url;

        // Промис клика
        clickResponsePromise = clients.openWindow(url);

        // Ждем, пока клик не отработает
        e.waitUntil(

            Promise.all([
                clickResponsePromise
            ])

        );

    }

}

// Метод по событию закрытия уведомления
// НЕ ИСПОЛЬЗУЕТСЯ
function onNotifyClose(e) {}