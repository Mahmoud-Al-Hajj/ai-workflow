-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "Workflow_userId_idx" ON "public"."Workflow"("userId");

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "public"."Workflow"("status");

-- CreateIndex
CREATE INDEX "Workflow_n8nWorkflowId_idx" ON "public"."Workflow"("n8nWorkflowId");

-- CreateIndex
CREATE INDEX "Workflow_createdAt_idx" ON "public"."Workflow"("createdAt");
