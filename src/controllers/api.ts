import {Response, Request, NextFunction} from "express";
import * as graph from "fbgraph";
import * as express from 'express';
/**
 * GET /api/facebook
 * Facebook API example.
 */
export const getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.user.tokens.find((token: any) => token.kind === "facebook");
    graph.setAccessToken(token.accessToken);
    graph.get(`${req.body.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
      if (err) { return next(err); }
      res.render("api/facebook", {
        title: "Facebook API",
        profile: results
      });
    });
  };

  export const router = express.Router()
  router.post('/api/facebook', getFacebook)