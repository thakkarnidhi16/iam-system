import { Request, Response, NextFunction } from 'express';
import { userHasPermission } from '../services/permissionService';

export function requirePermission(permissionName: string) {

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {

    try {

      // Make sure user is logged in
      if (!req.session.userId) {
        res.status(401).json({
          message: 'Authentication required'
        });

        return;
      }

      const hasPermission = await userHasPermission(
        req.session.userId,
        permissionName
      );

      if (!hasPermission) {
        res.status(403).json({
          message: 'Forbidden: insufficient permissions'
        });

        return;
      }

      next();

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: 'Something went wrong'
      });
    }
  };
}