import { logger } from '../utils/logger'
import { SocketIOServerHandlerService } from './socket-io-server-handler-service'

const SERVER_PORT = 5555

export class ExpressService {
    public static readonly instance = new ExpressService()
    private socketIoServerHandlerService: SocketIOServerHandlerService
    private server: any
    private socketServer: any
    private app: any

    constructor() {
        const express = require('express')
        const path = require('path')
        this.app = express()
        this.server = require('http').Server(this.app)
        this.socketServer = require('socket.io')(this.server)

        this.app.use('/', express.static(path.join(__dirname, '../../client')))

        this.socketIoServerHandlerService = new SocketIOServerHandlerService(
            this.socketServer
        )
        this.configureOnEvents()
    }

    private configureOnEvents() {
        this.server.on('connection', () => {
            this.app.get('/', ({}: any, res: any) => {
                logger.info('Connected Client')
                res.sendFile('index.html')
            })
        })

        this.socketServer.on('connection', (socket: any) => {
            logger.info(`Client connected: ${socket.client.id}`)
            this.socketIoServerHandlerService.setupSocketEvents(socket)
        })
    }

    public getSocketServer(): any {
        return this.socketServer
    }

    public getSocketIoServerHandlerService(): SocketIOServerHandlerService {
        return this.socketIoServerHandlerService
    }

    serverInit(): void {
        this.server.listen(SERVER_PORT)
        logger.info(`Server started at http://localhost:${SERVER_PORT}`)
    }
}