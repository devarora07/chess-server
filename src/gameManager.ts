import { WebSocket } from 'ws'
import { Game } from './game'
import { GAME_INFO, INIT_GAME, MOVE } from './messages'

export class GameManager {
  private pendingUser: WebSocket | null
  private games: Game[]
  private users: WebSocket[]

  constructor() {
    this.pendingUser = null
    this.games = []
    this.users = []
  }

  addUser(socket: WebSocket) {
    this.users.push(socket)
    this.handleMessage(socket)
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket)
  }

  handleMessage(socket: WebSocket) {
    socket.on('message', (data) => {
      const message = JSON.parse(data.toString())

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser, socket)
          this.games.push(game)
          this.pendingUser = null
        } else {
          this.pendingUser = socket
        }
      }

      const game = this.games.find(
        (game) => game.player1 === socket || game.player2 === socket
      )
      if (game) {
        if (message.type === MOVE) {
          console.log('inside move', message.move)

          console.log('inside makemove')
          game.makeMove(socket, message.move)
        }
        if (message.type === GAME_INFO) {
          game.gameInfo(socket)
        }
      } else {
        console.log('player is not in game')
        return
      }
    })
  }
}
