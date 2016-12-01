/**
 *
 * СЕРВИС НОТИФИКАЦИЙ
 *
 */

/**
 *
 * ОБъявляем переменные
 *
 */

var

    // Воркер
    sharedWorker = new SharedWorker('./notifySharedWorker.js');

/**
 *
 * Обработка
 *
 */

// Запускаем порт подключения к воркеру
sharedWorker.port.start();

// Запрос на отправку нотификаций
Notification.requestPermission();

/**
 *
 * События
 *
 */

// Прослушиваем сообщения от воркера
sharedWorker.port.addEventListener('message', onSharedWorkerMessage, false);

/**
 *
 * Методы
 *
 */

/**
 *
 * Обработчик события прихода сообщения от воркера
 * @param  {Object} e объект события сообщения от воркера
 *
 */
function onSharedWorkerMessage(e) {

    var

        // Сокращенный путь до данных
        data = e.data;

    // Переключение обработки по типу сообщения
    switch (data.cmd) {

        case 'connect': {

            // Получаем данные для нотификации
            var data = JSON.parse(data.workerData);

            console.info(data);

            break;

        }

        // Проверка на доступность от воркера
        // если мы ему отправляем ответ на этот запрос
        // то он нам может отправить нотификацию
        case 'ping.from.worker': {

            // Пингуемся
            sharedWorker.port.postMessage({cmd: 'ping.to.worker'});

            break;

        }

        // Отправка нотификации в браузер
        // внутри данные для нотификации
        case 'push': {

            var

                // Получаем данные для нотификации
                data = JSON.parse(data.workerData),

                // Будущий объект нотификации
                notification = null;

            // Получаем объект нотификации
            notification = new Notification(
                data.title,
                {
                    tag: data.target,
                    body: data.text,
                    icon: data.image
                }
            );

            // Вешаем обработчик события нотификации
            // По клику - переход по переданному url
            notification.onclick = function(e) {

                e.preventDefault();

                // Открываем новое окно
                window.open(data.link, '_blank');

            };

            break;

        }

        default: {

            console.log('пришло неопознанное сообщение');

        }

    }

}

/**
 * КОД ДЛЯ ТЕСТИРОВАНИЯ
 * В РЕАЛЬНОЙ ЖИЗНИ УДАЛИТЬ
 */

var

    socket = io.connect('//cryptic-coast-56094.herokuapp.com/', {
        secure: true,
        reconnectionAttempts: 1
    }),
    btn = document.getElementById('btn');

btn.addEventListener('click', function(e) {

    socket.emit('send.notification');

}, false);

socket.on('notification', function(res) {

    console.log(res);

});