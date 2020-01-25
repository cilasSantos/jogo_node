import express from 'express'
import http  from 'http'
import createGame from './public/game'
import socket from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = socket(server)

app.use(express.static('public'))

const game = createGame()
game.start()

game.subscribe((command) => {
    sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
    const playerId = socket.id
    console.log(`> Player connected: ${playerId}`)

    game.addPlayer({ playerId: playerId })
    console.log(game.state)
    socket.emit('setup', game.state)

    socket.on('disconnect', () =>{
        console.log(`> Player disconnected: ${playerId}`)
        game.removePlayer({playerId: playerId})
    })

    socket.on('move-player', (command) => {
        command.playerId = playerId
        command.type = 'move-player'

        game.movePlayer(command)
    })
})

server.listen(3000, () => {
    console.log(`> server listening on port ${3000}`)
})
