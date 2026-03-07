# Vela OS: The Modern Business Operating System

Vela is a high-performance, AI-integrated Business Operating System (OS) designed to unify all aspects of a modern startup or enterprise. Built with Next.js, Firebase, and Google Genkit, Vela provides a single source of truth for Sales, Operations, Finance, and Human Resources.

## 🚀 Vision
Vela OS is built to replace fragmented toolstacks. Instead of jumping between a CRM, an HR tool, and a spreadsheet for finance, Vela synchronizes your entire business logic into a single, intelligent interface.

## 🏗️ Core Modules

### 1. Unified Command Center (Dashboard)
The heart of the OS. A real-time executive overview of your organization's health, combining metrics from every active module into a single pane of glass. Includes a **Global Activity Ledger** for real-time system pulse monitoring.

### 2. CRM & Sales Intelligence
- **Sales Pipeline**: Visual Kanban-style deal tracking with automated state transitions.
- **Customer Directory**: Centralized client relationship management with detailed profiles.
- **Automated Workflows**: Moving a deal to "Closed Won" automatically initializes a Project and schedules a kickoff meeting.

### 3. Operations & Project Delivery
- **Project Tracking**: Manage ongoing client work with milestone-based progress logging (Research, Design, Dev, etc.).
- **AI Status Reports**: One-click generation of professional, executive-level client updates using Genkit AI.
- **Unified Schedule**: Integrated calendar for appointments and milestones with automated scheduling.

### 4. Financial Ledger & AI Forecasting
- **Real-time Ledger**: Track every dollar of income and expense with categorized entries.
- **AI Receipt Scanning**: OCR-powered transaction logging using Gemini Vision to extract vendor, amount, and category.
- **Predictive Insights**: AI-driven cash flow forecasting and strategic budgeting recommendations based on historical velocity.
- **Health Analysis**: Automated financial health scoring (0-100) and AI observations.

### 5. Human Resources (HR) Console
- **Team Directory**: Manage employee profiles, roles, and department headcounts.
- **Absence Management**: Streamlined leave request and approval workflows.
- **Vela Academy**: Interactive, tenant-scoped training and compliance modules with assessment quizzes.
- **Employee Helpdesk**: Internal ticketing system for prioritized HR support queries.

### 6. Analytics & Intelligence Hub (BI)
- **High-Level Dashboards**: Visual reporting for Sales (Pipeline value), Finance (Cash flow), Operations (Efficiency), and HR (Headcount).
- **Data Export**: One-click CSV exporting for all major business data modules.
- **Role-Based Clearance**: Intelligence reports are strictly limited to Admin and Super Admin roles.

### 7. Integrations Hub (App Directory)
- Connect external tools like Slack, Stripe, and Google Workspace.
- Centralized management of third-party sync states and active bridges.

## 🛡️ Architecture & Security

### Multi-tenancy & Instance Isolation
Vela OS is designed for universal deployment. Every organization that launches Vela receives a strictly partitioned **Business Instance**. Data is isolated at the database level using a `userId` (Tenant ID) scope, ensuring zero cross-tenant leakage.

### Role-Based Access Control (RBAC)
- **Super Admin**: Full OS control, user provisioning, system factory resets, and role management.
- **Admin**: Managerial access to HR, Finance, and Operations; access to Analytics.
- **Staff**: Operational focus on CRM, Projects, and personal tasks.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase (Firestore & Auth)
- **Styling**: Tailwind CSS & Shadcn UI
- **AI Engine**: Google Genkit (Gemini 2.5 Flash)
- **Charts**: Recharts

## 🛠️ Getting Started
1. **Sign Up**: The first user to register for a new instance is automatically granted **Super Admin** status.
2. **Onboarding**: Complete the **Business Identity Wizard** to configure your OS logic (Industry, Scale, etc.).
3. **Provision Team**: Use the **Settings > Roles** tab to add Admins and Staff members to your organization by email.

---

## 📄 License
**Proprietary License**  
All rights reserved. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.

---

**Made with love by AbdulBasit Ajibade**  
🔗 [GitHub Profile](https://github.com/Basit-of-Africa)

*Vela OS — Built to help businesses move at the speed of thought.*
