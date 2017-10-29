import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import * as express from 'express';

/**
 * POST /user
 * @param req 
 * @param res
 * @param next 
 */
export const addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await new User({
            email: req.body.email,
            password: req.body.password,
            passwordResetToken: '',
            passwordResetExpires: null
        });
        user.save();
        res.status(201).json({
            success: true,
            message: 'user saved.'
        });
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


export const router = express.Router()
router.post('/user', addUser)
router.get('/users', getUsers)