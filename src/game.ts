import { Chess } from 'chess.js'
import { WebSocket } from 'ws'
import { GAME_INFO, GAME_OVER, INIT_GAME, MOVE } from './messages'

export class Game {
  public player1: WebSocket
  public player2: WebSocket
  private board: Chess
  private startTime: Date
  private moveCount = 0

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1
    this.player2 = player2
    this.board = new Chess()
    this.startTime = new Date(Date.now())

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          message: {
            color: 'white',
          },
        },
      })
    )
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          message: {
            color: 'black',
          },
        },
      })
    )
  }

  makeMove(socket: WebSocket, move: { to: string; from: string }) {
    if (this.moveCount % 2 === 0 && this.player1 !== socket) return
    if (this.moveCount % 2 === 1 && this.player2 !== socket) return

    if (!this.board.isGameOver()) {
      try {
        this.board.move(move)
      } catch (err) {
        console.log('err', err)
        return
      }
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner: this.board.turn() === 'w' ? 'black' : 'white' },
        })
      )

      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner: this.board.turn() === 'w' ? 'black' : 'white' },
        })
      )
      return
    }
    if (this.moveCount % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: { move },
        })
      )
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: { move },
        })
      )
    }
    this.moveCount++
  }

  gameInfo(socket: WebSocket) {
    console.log('game info called....')
    socket.send(
      JSON.stringify({
        type: GAME_INFO,
        payload: {
          moveCount: this.moveCount,
          board: this.board,
        },
      })
    )
  }
}
