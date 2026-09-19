/**
 * Who may act on what. Pure functions over (actor, resource): no express, no
 * database, no side effects — so the rule can be read, and changed, in one
 * place rather than being restated at each call site.
 *
 * The actor is the authenticated User; an admin may act on anything.
 */

const isAdmin = (actor) => actor?.role === "admin";

/**
 * A Workflow is visible and deletable by its Owner. Viewing and deleting share
 * one rule today; they get separate functions if that ever stops being true.
 */
export function canAccessWorkflow(actor, workflow) {
  if (!actor || !workflow) return false;
  return isAdmin(actor) || workflow.userId === actor.id;
}

/**
 * A User may modify their own record.
 */
export function canModifyUser(actor, targetUserId) {
  if (!actor) return false;
  return isAdmin(actor) || actor.id === targetUserId;
}
