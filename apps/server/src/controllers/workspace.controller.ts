import { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
} from '../utils/workspace.validation.js'
import {
  checkWorkspacePermission,
  WorkspacePermissionError,
} from '../utils/workspace.permission.js'

export class WorkspaceController {
  static createWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
        })
      }

      const validation = CreateWorkspaceSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message:
              validation.error.issues[0]?.message || 'Invalid input data',
          },
        })
      }

      const { name, description } = validation.data

      const workspace = await prisma.$transaction(async (tx: any) => {
        const ws = await tx.workspace.create({
          data: {
            name,
            description,
            ownerId: userId,
          },
        })

        await tx.workspaceMember.create({
          data: {
            userId,
            workspaceId: ws.id,
            role: 'OWNER',
          },
        })

        return ws
      })

      return res.status(201).json({
        success: true,
        data: workspace,
      })
    } catch (error: any) {
      return WorkspaceController.handleError(res, error)
    }
  }

  static listWorkspaces = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
        })
      }

      const workspaces = await prisma.workspace.findMany({
        where: {
          isDeleted: false,
          members: {
            some: {
              userId,
              isDeleted: false,
              user: {
                isDeleted: false,
              },
            },
          },
        },
        include: {
          _count: {
            select: {
              members: {
                where: {
                  isDeleted: false,
                  user: {
                    isDeleted: false,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      const formattedWorkspaces = workspaces.map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        ownerId: w.ownerId,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        memberCount: w._count.members,
      }))

      return res.status(200).json({
        success: true,
        data: formattedWorkspaces,
      })
    } catch (error: any) {
      return WorkspaceController.handleError(res, error)
    }
  }

  static getWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
        })
      }

      const { workspaceId } = req.params
      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Workspace ID is required',
          },
        })
      }

      await checkWorkspacePermission(workspaceId, userId, 'VIEWER')

      const workspace = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
          isDeleted: false,
        },
        include: {
          members: {
            where: {
              isDeleted: false,
              user: {
                isDeleted: false,
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        })
      }

      const formattedMembers = workspace.members.map((m: any) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user,
      }))

      return res.status(200).json({
        success: true,
        data: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          ownerId: workspace.ownerId,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
          members: formattedMembers,
        },
      })
    } catch (error: any) {
      return WorkspaceController.handleError(res, error)
    }
  }

  static updateWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
        })
      }

      const { workspaceId } = req.params
      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Workspace ID is required',
          },
        })
      }

      await checkWorkspacePermission(workspaceId, userId, 'ADMIN')

      const validation = UpdateWorkspaceSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message:
              validation.error.issues[0]?.message || 'Invalid input data',
          },
        })
      }

      const updateData: Record<string, any> = {}
      if (req.body.name !== undefined) {
        updateData.name = validation.data.name
      }
      if (req.body.description !== undefined) {
        updateData.description = validation.data.description
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData,
      })

      return res.status(200).json({
        success: true,
        data: {
          id: updatedWorkspace.id,
          name: updatedWorkspace.name,
          description: updatedWorkspace.description,
          ownerId: updatedWorkspace.ownerId,
          createdAt: updatedWorkspace.createdAt,
          updatedAt: updatedWorkspace.updatedAt,
        },
      })
    } catch (error: any) {
      return WorkspaceController.handleError(res, error)
    }
  }

  static deleteWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
        })
      }

      const { workspaceId } = req.params
      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Workspace ID is required',
          },
        })
      }

      await checkWorkspacePermission(workspaceId, userId, 'OWNER')

      await prisma.$transaction(async (tx: any) => {
        const now = new Date()

        await tx.workspace.update({
          where: { id: workspaceId },
          data: { isDeleted: true, deletedAt: now },
        })

        await tx.workspaceMember.updateMany({
          where: { workspaceId, isDeleted: false },
          data: { isDeleted: true, deletedAt: now },
        })

        await tx.document.updateMany({
          where: { workspaceId, isDeleted: false },
          data: { isDeleted: true, deletedAt: now },
        })
      })

      return res.status(200).json({
        success: true,
        message: 'Workspace deleted successfully',
      })
    } catch (error: any) {
      return WorkspaceController.handleError(res, error)
    }
  }

  private static handleError(res: Response, error: any) {
    if (error instanceof WorkspacePermissionError) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      })
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    })
  }
}
