# Outstanding TODO Items

This document tracks TODO comments found in the repository. Each item lists the file and a short description of the work required.

## Implemented
- **frontend/src/app/launchtoken/page.tsx** – Added filtering logic for search, status and category.

## Pending Tasks
- **.git/hooks/sendemail-validate.sample** – Sample hook contains placeholder checks. Decide whether to customize or remove this sample file.
- **frontend_backup/src/services/extendedApiService.ts** – Implement backend endpoints for:
  - user profile retrieval and updates
  - investment CRUD actions
  - liquidity/volume/overview chart data
  - wallet connect/disconnect
  - tournament participation
- **frontend_backup/src/components/investment/investment-table.tsx** – Hook up user investment endpoint in `loadInvestments`.
- **frontend_backup/src/components/screens/solcraft-dashboard.tsx** – Load actual user portfolio and include organizer and participant data when transforming tournaments. Replace placeholder ROI calculation.
- **frontend_backup/src/components/tournament/tournament-table.tsx** – Populate organizer, participant counts, real ROI and organizer rating from backend data.

