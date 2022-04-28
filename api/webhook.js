const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

//Секретный ключ базы данных
const serviceAccount = {
    "type": "service_account",
    "project_id": "alina-bot-7040f",
    "private_key_id": "3a1091adf1fd18fb42fb646b5c63ec1252c607e4",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHqQ7YZYYalCrp\nlDbDsGsiEh/VG5789KMVVybEQd1RxUnVG32YpsiOkklLTQ70zfl6iRiEeDTZDxem\nbWfQDtjctwTMSPPzk0mhkifpbsvPZsTO3Izh2sx+VEdGzESbnCqimvy1ZtDli2G8\nznyXov1jk8RMZc7FPwjP8uKQ9PNHHcu/SAPYXOSD85ovAaVfLCbh+syYPei7HDNQ\nH13OOeO7yKi0wuFcc5HzVT87Ab/OZOMOTSvwPyl5c/fBk/ISLtB2rGjPjw2qPGUS\nwvNuiux++eOdOoF4yfEhv/0w9AmquzyUbNHYzAprgFXJCC0X0EVqNWA4befGoV8A\n2S72+3/7AgMBAAECggEAKRznwKmPJrPx7i0l5b/TH63pviE06NObLU7H3cvOPgNJ\nA8foYeGeFLWMwCO6+6/aOmA2mziBcVzJOuz2XoJgJ3rMUyCGk1Z15/5Hl6rH7woz\nZoFFxVAfobfLAYoYao6KvPb7KINmao377zv5rePTF4ka97xTCozDTMav3reBzNe5\nfVf94q7T3fX4OulPiKRxVNxWFUTTkpyXSwLoK1qBxRNHiyMg/bqQ5neOXLrec1m+\n4NLLyFevJvPpHenV5ydpuL+7vmkaacoFu2ClFV3RjJjxdTuM1ArEC9IgU+eL/eg9\nGxdltl6pjZqCidz0JL1k4n1eSjUCn/FyGB4kX0o34QKBgQDzFU2jl177/Id3jM7w\nBwqbVljdC4JW8xm2W2fJSiDftKiSz2UN6H650gv5CNBY4hVN1AmP+esq2tKjNV58\naAjZk5+HKb5v0mrkFLg8szCxLRR1l6IvSCRNKOkeo2RAdrj49ZmERNxzMAfKHdOs\nsO1oywyPrDei2ZSnNTULFMv2UQKBgQDSRRFJkmqdaW8XSrK/Usgtj/bKISL6Veby\nC9Z1uQe2d6xgNmS/YqoInd9ZWa8ht2Zcja5q8O6Iohm7QSoZn1kvjBVQUN7FguaD\nQtuaQfciVBs6RLU/xyTGlMT1d9fpbK/SAL0rNWuZWhZV0ypfGK6DAntDLCRr8rhq\nI/+3zaYiiwKBgB0EKvtfI1BzCXyky0LtpD98pCjmqc1VQXl6Gb52YcwyVXkI1qg9\nW3s07obwnWYuvppGuEl+bKr16fTfdwLkrEHElGNfAUN525aUPpXIUgSkO+/5hLue\nIe8v9fvZRytGwLe/IW8fhS0ey589xjmz+PLsYfh4dz+yN0NqX4WOGvaxAoGAQjIs\nNxU5K0U+C/8gNstA6dcgwpGcCWNxyVGgun79xpv2UHPPU9Ej5oKNBfwN/ndWalzQ\nRCqFbc5ae3EQZ/CaizV2oEpVV6jWGQy7RdzuiIgh6j4nMWToVvwO5ZhNCNeGon5J\nD4lJzoVl8q7/7+A9UFE/rO4AqVtIY2Hh52N+ofECgYAzywcwK43TphLm1qNHNioT\nvJL7J618A4HW0JuCftl5/k7IOO7Da3i5HE1uGdZQQ9VrjcZR2TaOmjVEiDnkWS+n\nLda7laMEGtV53KKxC6cwcq2AFNSYodTgidhKledN8XB01lNrXqZu9quQkhyZXOQj\nBinwyuzJMsm4HpOPE+K+4w==\n-----END PRIVATE KEY-----\n",
    "client_email": "access@alina-bot-7040f.iam.gserviceaccount.com",
    "client_id": "113357797032945333044",       
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/access%40alina-bot-7040f.iam.gserviceaccount.com"
}

//Точка входа бессерверной функции
module.exports = async (request, response) => {
    try {
        
        const starttext = 'Привет😎! Это бот заказов от <Название компании 💼 впишите здесь>! Отправьте номер заказа, и я пришлю вам его статус 🚚';


        //Подключаемся к базе данных
        initializeApp({
            credential: cert(serviceAccount)
          });
        //Получаем экземпляр базы данных
        const db = getFirestore();

        //Запускаем обработчика бота
        const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
        //Получаем тело  запроса
        const { body } = request;

        //Если запрос это сообщение
        if (body.message) {
            //Вытаскиваем данные из запроса телеграмма
            const { chat: { id }, text, entities } = body.message;
            message = ''

            //Если пришли какие-то дополнительные данные(команды)
            if (entities && entities.length > 0){
                //Достаем данные
                const {offset, length, type} = entities[0]
                //Если это команда
                if (type == 'bot_command'){
                    //Если это команда старт
                    if (text == '/start'){
                        message = starttext;
                    }
                    else{
                        message = 'Данная команда не поддерживается'
                    }
                }
            }else{
                //Запрашиваем у базы данных данные заказа
                let order = await db.collection('orders').doc(text).get();
                //Если такой заказ есть, то выводим его  статус
                if(order.exists){
                    message = "Статус заказа " + text + ": " +order.data().status;
                //Иначе выводим ошибку
                }else{
                    message = "Заказ с номером " + text + " не найден";
                }
            }
            //Отправляем ответ пользователю
            await bot.sendMessage(id, message);
        }
    }
    catch(error) {
        console.error('Error sending message');
        console.log(error.toString());
    }
    //Отправляем ответ об успешности в телеграм
    response.send('OK');
};