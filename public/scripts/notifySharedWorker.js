/**
 *
 * Воркер для передачи нотификаций через сокеты
 * работает в desktop: WebKit, Firefox, Opera
 *
 */

// Подключаем скрипт сокета
importScripts('//cdn.socket.io/socket.io-1.4.5.js');

/**
 *
 * ОБъявляем переменные
 *
 */
var

    // Подключения
    peers = [],

    // id подключения
    connectionId = 0,

    // Переключатель отправки сообщения
    msgSended = false,

    // Будущий сокет
    socket = null,

    // Настройки сокета
    socketOptions = {
        secure: true,
        reconnectionAttempts: 1
    },

    // Путь до сокета
    socketAPI = '//cryptic-coast-56094.herokuapp.com/';

/**
 *
 * Обработка
 *
 */

// Поключаем сокет
socket = io.connect(socketAPI, socketOptions);

// Подписываемся на получение нотификации
socket.on('notification', onSocketMessage);

/**
 *
 * События
 *
 */

// Подписываемся на событие подключения к воркеру
self.addEventListener('connect', onConnect, false);

/**
 *
 * Методы
 *
 */

/**
 *
 * Функция на момент подключения к воркеру
 * @param  {Object} e объект события
 *
 */
function onConnect(e) {

    var

        // Сохраняем порт подключения
        port = e.ports[0];

    // Увеличиваем счетчик подключений
    connectionId++;

    // Помещаем в массив подключений
    // нового подключившегося
    peers.push({
        port: port,
        connectionId: connectionId
    });

    port.postMessage({
        cmd: 'connect',
        workerData: JSON.stringify(peers)
    });

    // Запускаем прослушивание порта
    port.start();

}

/**
 *
 * Функция срабатывает, когда приходит сообщение в воркер
 * @param  {Object} e объект события
 *
 */
function onMessage(e, port, responseData) {

    var

        // Короткая запись данных сообщения
        data = e.data;

    // Если сообщение еще никому не было передано,
    // то обрабатываем его
    if (!msgSended) {

        // Переключение обработки по типу сообщения
        switch (data.cmd) {

            // Если пришел пинг в воркер
            // то можем отправлять по этому порту сообщение
            case 'ping.to.worker': {

                // Отправляем сообщение
                // с данными для нотификации
                port.postMessage({
                    cmd: 'push',
                    workerData: JSON.stringify(responseData)
                });

                // Отмечаем,
                // что сообщение отправлено
                msgSended = true;

                break;

            }

            // В любом другом случае отправляем ошибку
            default: {

                // Отправляем ошибку
                port.postMessage({
                    cmd: 'error',
                    workerData: 'some error'
                });

            }

        }

    }

}

/**
 *
 * Функция срабатывает, когда приходит сообщение по сокету
 * @param  {Object} response данные по сокету
 *
 */
function onSocketMessage(response) {

    // Сбрасываем переключатель того,
    // что сообщение отправлено
    msgSended = false;

    // Проходим по всем подключениям
    // и пингуем их
    peers.forEach(function(peer){

        // Пингуем подключения
        peer.port.postMessage({cmd: 'ping.from.worker'});

        // Подписываем порт на собщение к воркеру извне
        peer.port.addEventListener('message', function(e) {

            // Обрабатываем пришедшее сообщение
            onMessage(e, peer.port, response.data)

        }, false);

    });

}