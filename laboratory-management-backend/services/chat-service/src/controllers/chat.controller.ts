import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/error.middleware.js';
import { callAgent } from '../services/agent.service.js';
import { callFAQAgent } from '../services/faq-agent.service.js';
import { getDb } from '../config/database.config.js';

export const startChat = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.auto = true
    #swagger.tags = ['AI Chat']
    #swagger.description = 'Start a new chat conversation'
    #swagger.parameters['message'] = {
      in: 'body',
      name: 'message',
      required: true,
      description: 'Message to start the chat'
    }
    #swagger.responses[200] = {
      description: 'Chat started successfully'
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { message } = req.body;
    
    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const threadId = Date.now().toString();
    const db = getDb();
    const response = await callFAQAgent({ db, query: message, threadId });
    
    res.status(200).json({
      status: 'success',
      data: {
        threadId,
        response
      }
    });
  } catch (error) {
    next(error);
  }
};

export const continueChat = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.auto = true
    #swagger.tags = ['AI Chat']
    #swagger.description = 'Continue an existing chat conversation'
    #swagger.parameters['threadId'] = {
      in: 'path',
      name: 'threadId',
      required: true,
      description: 'ID of the chat thread'
    }
    #swagger.parameters['message'] = {
      in: 'body',
      name: 'message',
      required: true,
      description: 'Message to continue the chat'
    }
    #swagger.responses[200] = {
      description: 'Chat continued successfully'
    }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { threadId } = req.params;
    const { message } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    if (!threadId) {
      throw new AppError('Thread ID is required', 400);
    }

    const db = getDb();
    const response = await callFAQAgent({ db, query: message, threadId });
    
    res.status(200).json({
      status: 'success',
      data: {
        response
      }
    });
  } catch (error) {
    next(error);
  }
};
