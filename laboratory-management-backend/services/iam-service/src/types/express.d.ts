declare global {
  namespace Express {
    interface Request {
      user?: any; // Using any for now to avoid type conflicts
    }
  }
}
