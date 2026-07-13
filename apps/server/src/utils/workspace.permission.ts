import { prisma } from '../lib/prisma.js'
import { WorkspaceRole } from '@prisma/client'

export class WorkspacePermissionError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const ROLE_WEIGHTS: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
}

export async function checkWorkspacePermission(
  workspaceId: string,
  userId: string,
  requiredRole: WorkspaceRole
) {
  // Check if workspace exists and is not deleted
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
      isDeleted: false,
    },
  })

  if (!workspace) {
    throw new WorkspacePermissionError(404, 'NOT_FOUND', 'Workspace not found')
  }

  // Check if member exists, is not deleted, and associated user is not deleted
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      user: true,
    },
  })

  if (!member || member.isDeleted || member.user.isDeleted) {
    throw new WorkspacePermissionError(
      403,
      'FORBIDDEN',
      "You don't have permission to access this workspace"
    )
  }

  const memberWeight = ROLE_WEIGHTS[member.role] || 0
  const requiredWeight = ROLE_WEIGHTS[requiredRole] || 0

  if (memberWeight < requiredWeight) {
    throw new WorkspacePermissionError(
      403,
      'FORBIDDEN',
      "You don't have permission to perform this action"
    )
  }

  return { workspace, member }
}
