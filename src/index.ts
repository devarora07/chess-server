import { WebSocketServer, Server } from 'ws'
import { GameManager } from './gameManager'
import http from 'http'
import express from 'express'

const app = express()

const server = http.createServer(http)

server.listen(5050)

const wss = new WebSocketServer({ server })

const gameManager = new GameManager()

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws)
  ws.on('error', console.error)

  ws.on('close', () => {
    gameManager.removeUser(ws)
  })
})
