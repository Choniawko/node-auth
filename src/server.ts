import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as socketIO from 'socket.io'
import * as http from 'http'
import * as mongoose from 'mongoose'
import passport from '../config/passport'
import config from '../config'
import { router as userRouter } from './controllers/user'
import { router as apiRouter } from './controllers/api'

class Server {
    app: express.Express
    server: http.Server
    port: number = 5000
    router: express.Router
    private io: SocketIO.Server

    constructor () {
        this.app = express()
        this.router  = express.Router()
        this.server = http.createServer(this.app)
        this.io = socketIO(this.server);
        this.setConfig()
        this.setHeaders()
        this.setStaticRoutes()
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
            res.send('index')
        )
        this.app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
        this.app.get('/auth/facebook/callback', passport.authenticate('facebook', 
            { failureRedirect: '/login' }
        ), (req, res) => {
          res.redirect('/');
        });
        this.router.use(userRouter)
        this.router.use(apiRouter)
        this.app.use(this.router)
    }

    private setStaticRoutes() {
        this.app.use("/node_modules", express.static(
            path.join(__dirname, "../../node_modules")
        ));
        this.app.set("views", path.join(__dirname, "./views"));
        this.app.use(express.static(path.join(__dirname, "./views")));
        this.app.engine(".html", require("ejs").__express);
        this.app.set("view engine", "html");

    }

    public setConfig(): void {
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(bodyParser.urlencoded( {extended: true}));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
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

    private listenSocket(): void {
        this.io.on("connection", (socket) => {
            socket.on("message", (msg: string) => {
                this.io.emit("message", msg);
            });
        });
     }

    public startServer (): void {
        this.server.listen(this.port, 'localhost', () => {
            console.log(
                `Aplication listening on
                http://${this.server.address().address}:${this.server.address().port}`)
        })
        this.listenSocket();
    }

}
export default Server
