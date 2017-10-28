import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import * as mongoose from 'mongoose'
import config from '../config'

class Server {
    app: express.Express
    server: http.Server
    port: number = 5000

    constructor () {
        this.app = express()
        this.server = http.createServer(this.app)
        this.setHeaders()
        this.setRoutes()
     }

    public setHeaders(): void {
        this.app.use((req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, enctype');
          next();
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
