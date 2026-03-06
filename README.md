# Vela OS: The Modern Business Operating System

Vela is a high-performance, AI-integrated Business Operating System (OS) designed to unify all aspects of a modern startup or enterprise. Built with Next.js, Firebase, and Google Genkit, Vela provides a single source of truth for Sales, Operations, Finance, and Human Resources.

## 🚀 Vision
Vela OS is built to replace fragmented toolstacks. Instead of jumping between a CRM, an HR tool, and a spreadsheet for finance, Vela synchronizes your entire business logic into a single, intelligent interface.

## 🏗️ Core Modules

### 1. Unified Command Center (Dashboard)
The heart of the OS. A real-time executive overview of your organization's health, combining metrics from every active module into a single pane of glass.

### 2. CRM & Sales Intelligence
- **Sales Pipeline**: Visual Kanban-style deal tracking.
- **Customer Directory**: Centralized client relationship management.
- **Automated Kickoffs**: Winning a deal automatically initializes a Project and schedules a kickoff meeting.

### 3. Operations & Project Delivery
- **Project Tracking**: Manage ongoing client work with real-time progress logging.
- **AI Status Reports**: One-click generation of professional client updates using Genkit AI.
- **Unified Schedule**: Integrated calendar for appointments and milestones.

### 4. Financial Ledger & AI Forecasting
- **Real-time Ledger**: Track every dollar of income and expense.
- **AI Receipt Scanning**: OCR-powered transaction logging using Gemini Vision.
- **Predictive Insights**: AI-driven cash flow forecasting and strategic budgeting recommendations.
- **Health Analysis**: Automated financial health scoring (0-100) based on ledger velocity.

### 5. Human Resources (HR) Console
- **Team Directory**: Manage employee profiles and roles.
- **Absence Management**: Streamlined leave request and approval workflows.
- **Vela Academy**: Interactive, tenant-scoped training and compliance modules.
- **Employee Helpdesk**: Internal ticketing system for HR support.
- **Induction Automation**: Automated checklists and paperwork generation for new hires.

### 6. Analytics & Intelligence Hub
- **BI Dashboards**: Visual reporting for Sales, Finance, Operations, and HR.
- **Data Export**: Export any report to CSV for external auditing.
- **Custom Filters**: Slice business data by date, department, or deal stage.

### 7. Integration Hub (App Directory)
- Connect external tools like Slack, Stripe, and Google Workspace.
- Centralized management of third-party webhooks and API bridges.

## 🛡️ Architecture & Security

### Multi-tenancy & Instance Isolation
Vela OS is designed for universal deployment. Every organization that launches Vela receives a strictly partitioned **Business Instance**. Data is isolated at the database level using a `userId` (Tenant ID) scope, ensuring zero cross-tenant leakage.

### Role-Based Access Control (RBAC)
- **Super Admin**: Full OS control, user provisioning, and system resets.
- **Admin**: Managerial access to HR, Finance, and Operations.
- **Staff**: Operational focus on CRM and Project delivery.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase (Firestore & Auth)
- **Styling**: Tailwind CSS & Shadcn UI
- **AI Engine**: Google Genkit (Gemini 2.5 Flash)
- **Charts**: Recharts

## 🛠️ Getting Started
1. **Sign Up**: The first user to register for a new instance is automatically granted **Super Admin** status.
2. **Onboarding**: Complete the Business Identity wizard to configure your OS logic (Industry, Scale, etc.).
3. **Provision Team**: Use the **Settings > Roles** tab to add Admins and Staff members to your organization.

---
*Vela OS — Built to help businesses move at the speed of thought.*