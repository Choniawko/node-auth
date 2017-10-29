import { Request, Response, NextFunction } from 'express'
import User from '../models/user'
import * as express from 'express'
import * as bcrypt from 'bcrypt-nodejs'
import * as jwt from 'express-jwt-session'
import config from '../../config'

const isAuthenticated = jwt.isAuthenticated(config.secret)

/**
 * POST /user
 * @param req 
 * @param res
 * @param next 
 */
export const addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body
        console.log(req.headers)
        const user = await User.findOne({email})
        if (user) {
            throw new Error('This email already exist')
        } else {
            const user = await new User({
                ...req.body,
                passwordResetToken: '',
                passwordResetExpires: null
            });
            user.save();
            res.status(201).json({
                success: true,
                message: 'user saved.'
            });
        }
        
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * GET /users
 * List of users
 * @param req 
 * @param res
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.status(200).json({
            users,
            success: true,
            message: ''
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * POST /login
 * @param req 
 * @param res 
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if (!user) {
            throw Error('No such user found');
        }
        bcrypt.compare(password, user.get('password'), (err, result) => {
            if (result) {
                const payload = {id: user.get('_id')};
                const token = jwt.signToken(payload, config.secret);
                res.status(200).json({
                    token,
                    user,
                    success: true,
                    message: 'authenticated'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Passwords did not match'
                });
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};


export const router = express.Router()
router.post('/user', addUser)
router.post('/login', login)
router.get('/users', isAuthenticated, getUsers)