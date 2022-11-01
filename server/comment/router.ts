import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import CommentCollection from './collection';
import * as userValidator from '../user/middleware';

const router = express.Router();

/**
 * Get all the comments of a freet 
 *
 * @name GET /api/comment/:id
 *
 * @return {Comment[]} - A list of all the comments attached to a freet
 * @throws {400} - If freetId is not given
 */
router.get(
  '/:freet?',
  async (req: Request, res: Response, next: NextFunction) => {
    const freetId = (req.query.freet as string);
    const allComments = await CommentCollection.findAll(freetId);
    res.status(200).json(allComments);
  }
);

/**
 * Add a new comment
 *
 * @name POST /api/comment
 *
 * @return {FreetResponse} - The commented freet
 * @throws {403} - If the user is not logged in
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    const commenterId = (req.session.userId as string);
    const freetId = (req.body.freetId as string);
    const content = (req.body.commentContent as string);
    
    const comment = await CommentCollection.addOne(commenterId, freetId, content);
    res.status(201).json({
      message: 'You have successfully added your comment',
      comment: comment
    });
  }
);

/**
 * Delete a comment
 *
 * @name DELETE /api/comment/:commentId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in 
 */
router.delete(
  '/:commentId?',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    await CommentCollection.deleteOne(req.params.commentId);
    res.status(200).json({
      message: 'Your comment was deleted successfully.'
    });
  }
);

export {router as commentRouter};
