# Project Setup

1. After connecting with Postgres, run migrations:
   ```bash
   npm run migration:run
   ```

2. Create users based on:
   - **Roles:** admin, user
   - **Designations:** manager, tester, qa, etc.

3. Project permissions:
   - Admin only can:
     - Create a project
     - Add users into that project
   - Project members can:
     - Add issues
     - Edit issues
     - Add comments on issues
   - The user currently assigned to an issue can reassign it to another user in the same project

4. Issue permissions:
   - Users can edit an issue only if they are assigned to it
   - Only the creator of an issue can delete it

5. Project statuses:
   - Each project has its own set of statuses
   - Statuses are created by the admins of that project
   - A project can have multiple admins
