const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

//Секретный ключ базы данных
const serviceAccount = {
    "type": "service_account",
    "project_id": "alina-bot-7040f",
    "private_key_id": "3a1091adf1fd18fb42fb646b5c63ec1252c607e4",
    "private_key": "/**СЕКРЕТНЫЙ КЛЮЧ*/",
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
