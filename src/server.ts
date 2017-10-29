import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import * as mongoose from 'mongoose'
import config from '../config'
import { router as userRouter } from './controllers/user'

class Server {
    app: express.Express
    server: http.Server
    port: number = 5000
    router: express.Router

    constructor () {
        this.app = express()
        this.router  = express.Router()
        this.server = http.createServer(this.app)
        this.setConfig()
        this.setHeaders()
        this.setRoutes()
        this.mongoConnect()
        this.handleUnAuthorization()
     }

    public setHeaders(): void {
        this.app.use((req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, enctype');
          next();
        });
    }

    public handleUnAuthorization(): void {
        this.app.use((err, req, res, next) => {
            if (err.name === 'UnauthorizedError') {
              return res.status(403).send({
                success: false,
                message: 'No token provided.'
              });
            }
          });
    }

    public setRoutes(): void {
        this.app.get('/', (req: express.Request, res: express.Response) => 
            res.json({
                protocol: req.protocol,
                hostname: req.hostname,
                port: this.port
            })
        )
        this.router.use(userRouter)
        this.app.use(this.router)
    }

    public setConfig(): void {
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(bodyParser.urlencoded( {extended: true}));
    }

    public mongoConnect(): void {
        (<any> mongoose).Promise = global.Promise;
        
        if (config.database) {
            mongoose.connect(config.database, {useMongoClient: true}, (err: any) => {
                if (err) {
                    console.log('err', err);
                } else {
                    console.log('Połaczono z bazą');
                }
            });
            this.app.set('secret', config.secret);
        }
    }

    public startServer (): void {
        this.server.listen(this.port, 'localhost', () => {
            console.log(
                `Aplication listening on
                http://${this.server.address().address}:${this.server.address().port}`)
        })
    }

}
export default Server
