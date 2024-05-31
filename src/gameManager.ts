import { WebSocket } from 'ws'
import { Game } from './game'
import { GAME_INFO, GET_USERS, INIT_GAME, MOVE, PENDING_USER } from './messages'

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

  getUsers(socket: WebSocket) {
    console.log('get users called..')
    socket.send(
      JSON.stringify({
        type: GET_USERS,
        payload: {
          usersCount: this.users.length,
          users: this.users,
        },
      })
    )
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket)
  }

  initGame(socket: WebSocket) {
    if (this.pendingUser) {
      const game = new Game(this.pendingUser, socket)
      this.games.push(game)
      this.pendingUser = null
    } else {
      this.pendingUser = socket
      socket.send(
        JSON.stringify({
          type: PENDING_USER,
          message: { text: 'waiting for other user to join' },
        })
      )
    }
  }

  handleGameInfo(socket: WebSocket) {
    const game = this.games.find(
      (game) => game.player1 === socket || game.player2 === socket
    )
    if (!game) return
    game.gameInfo(socket)
  }

  handleMove(socket: WebSocket, move: { to: string; from: string }) {
    const game = this.games.find(
      (game) => game.player1 === socket || game.player2 === socket
    )
    if (!game) return
    console.log('inside move', move)
    game.makeMove(socket, move)
  }

  handleMessage(socket: WebSocket) {
    socket.on('message', (data) => {
      const message = JSON.parse(data.toString())
      console.log('message', message.type)

      switch (message.type) {
        case INIT_GAME:
          this.initGame(socket)
          return
        case MOVE:
          const move = message.payload.move
          if (move) {
            this.handleMove(socket, move)
          } else {
            console.log('move is undefined', move)
          }
          return
        case GAME_INFO:
          this.handleGameInfo(socket)
          return
        case GET_USERS:
          this.getUsers(socket)
          return
        default:
          return
      }
    })
  }
}
