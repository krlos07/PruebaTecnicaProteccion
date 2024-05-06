const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes/index');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const nodemailer = require('nodemailer');

app.set('view engine', 'ejs');
app.use('/', routes);
app.use(express.static('public'));


io.on('connection', (socket) => {
    setInterval(() => {
        // Obtenemos la hora actual en tiempo real para mostrar con socket
        let date = new Date();
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        socket.emit('time', `${hours}:${minutes}:${seconds}`);
    }, 1000);

    socket.on('generate', (email) => {
        // Ontenemos la hora actual y la separamos por minutos y segundos para obtener las semillas y el numero de repeticiones
        let date = new Date();
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        // Semillas
        let seed1 = parseInt(date.getMinutes().toString().padStart(2, '0')[0]);
        let seed2 = parseInt(date.getMinutes().toString().padStart(2, '0')[1]);
        // Numero de repeticiones
        let count = date.getSeconds();
        // Almacenamos las semillas en un arreglo
        let fibonacci = [seed1, seed2];
        // Iniciamos la serie fibonacci
        for(let i = 2; i < parseInt(count) + 2; i++) {
            fibonacci[i] = fibonacci[i - 1] + fibonacci[i - 2];
        }
        // Ordenamos el arreglo de forma descendente para mostrar
        fibonacci.reverse()
        // Configuración del correo electrónico usando nodemailer
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'carlosandresgomon@gmail.com',
                pass: 'xvxgkcyyotxksldc'
            }
        });
        // Infromación del destinatario con los datos de fibonacci generado
        let mailOptions = {
            from: 'carlosandresgomon@gmail.com',
            to: email || 'didier.correa@proteccion.com.co',
            subject: 'Prueba Técnica | Serie Fibonacci',
            text: `Hora de ejecución: ${hours}:${minutes}:${seconds}\nSemillas: ${seed1}, ${seed2}\nSerie Fibonacci: ${fibonacci.join(', ')}`
        };
        // Envío del correo electrónico
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                socket.emit('message', 'Error al enviar el correo electrónico.');
            } else {
                console.log('Email sent: ' + info.response);
                socket.emit('message', 'Correo electrónico enviado con éxito.');
            }
        });
        // Retornamos los datos obtenidos para mostrar con el socekt
        socket.emit('fibonacci', { seeds: `${seed1}, ${seed2}`, timeExec: date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(), fibonacci: fibonacci });
    });
});

server.listen(3000, () => {
    console.log('App is listening on port 3000');
});