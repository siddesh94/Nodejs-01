var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)
var mongoose = require('mongoose')

var dbUrl = 'mongodb+srv://admin2:admin2@cluster0.du9op.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var Message = mongoose.model('Message', {
    name: String,
    message: String,
})
// var messages = [
//     { name: 'Sid', message: 'Hey!' },
//     { name: 'Nick', message: 'Hello!' },
// ];
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        console.log('messagessss --------');
        res.send(messages);
    });
})

app.post('/messages', async (req, res) => {
    if (req.body) {
        /** USING ASYNc AWAIT */
        try {
            var message = new Message(req.body);
            var savedMessage = await message.save()

            var censored = await Message.findOne({ message: 'badword' })
            if (censored) {
                await Message.remove({ _id: censored._id })
            } else {
                io.emit('message', req.body)
            }
            res.sendStatus(200)
        } catch (error) {
            if (error) {
                console.log('save failed', error);
                sendStatus(500)
            }
        } finally {
            console.log('Finally called')
        }
        

        /**USing Promise */
        // var message = new Message(req.body);
        // message.save().then(() => {
        //     console.log('save successfully');
        //     return Message.findOne({ message: 'badword' })
        // }).then((censored) => {
        //     if (censored) {
        //         console.log('censored word found', censored);
        //         Message.delete({ _id: censored._id, }, (err) => {
        //             console.log('removed censored word');
        //         })
        //     }
        //     io.emit('message', req.body);
        //     res.sendStatus(200);
        // }).catch((err) => {
        //     if (err) {
        //         console.log('save failed');
        //         sendStatus(500)
        //     }
        // })
    } else {
        res.sendStatus(400);
    }
})

io.on('connection', (socket) => {
    console.log('USer connected')
})


mongoose.connect(dbUrl, (err) => {
    console.log('Mongo DB Connection', err)
})



var server = http.listen(3000, () => console.log('Server is listening on', server.address().port));