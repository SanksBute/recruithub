# RecruitHub - Complete Feature List & User Guide

## Table of Contents
1. [User Roles & Permissions](#user-roles--permissions)
2. [Client Management](#client-management)
3. [Position Management](#position-management)
4. [Candidate Management](#candidate-management)
5. [Profile Review & Workflow](#profile-review--workflow)
6. [Profile Sharing & Email](#profile-sharing--email)
7. [Interview Management](#interview-management)
8. [User Management](#user-management)
9. [Email Configuration](#email-configuration)
10. [Data Export](#data-export)
11. [Advanced Features](#advanced-features)

---

## User Roles & Permissions

### Admin
- Full system access
- Configure email settings (SMTP)
- Create/Edit/Delete all entities
- User management
- Access all data across the system

### Manager  
- View and manage all clients, positions, candidates
- Approve/reject candidate profiles
- Share profiles with clients
- Schedule interviews
- Create new users
- Cannot delete entities or configure system settings

### Team Leader
- View and manage assigned clients and positions
- Approve/reject candidates for assigned positions
- Share profiles with clients
- Schedule interviews
- Limited to data within assigned scope

### Recruiter
- View assigned positions
- Add candidates (manual and bulk upload)
- View own candidates
- Cannot approve/reject or share profiles
- Limited to assigned data only

---

## Client Management

### Features
- ✅ **Add New Clients** - Capture complete company information
- ✅ **Edit Client Details** - Update client information (Admin/Manager/TL)
- ✅ **Delete Clients** - Remove clients (Admin only, checks for dependencies)
- ✅ **View Client List** - Role-based filtering
- ✅ **Export to CSV** - Download complete client database

### Client Information Captured
- Client Name
- Industry/Sector
- Organization Type
- Headquarter Location
- Other Branch Locations
- Company Website
- Core Business Description
- Contact Email Addresses (multiple)

### Access Control
| Action | Admin | Manager | Team Leader | Recruiter |
|--------|-------|---------|-------------|-----------|
| View All | ✓ | ✓ | ✗ | ✗ |
| View Assigned | ✓ | ✓ | ✓ | ✓ |
| Create | ✓ | ✓ | ✓ | ✗ |
| Edit | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ |
| Export CSV | ✓ | ✓ | ✓ | ✓ |

---

## Position Management

### Features
- ✅ **Create Positions** - Define job requirements
- ✅ **Edit Positions** - Update job details
- ✅ **Delete Positions** - Remove positions (checks for candidates)
- ✅ **Assign Recruiters** - Link recruiters to positions
- ✅ **Upload Job Descriptions** - Attach JD files
- ✅ **Track Position Status** - Open, In Progress, On Hold, Closed
- ✅ **Export to CSV** - Download position data

### Position Details
- Client Association
- Job Title
- Department
- Number of Openings
- Reason for Hiring
- Team Size
- Location
- Work Mode (Onsite/Hybrid/Remote)
- Working Days
- Qualification Requirements
- Experience Requirements
- Must-Have Skills
- Good-to-Have Skills
- Gender Preference (optional)
- Assigned Recruiters

### Position Statuses
- **Open** - Actively recruiting
- **In Progress** - Candidates being screened
- **On Hold** - Temporarily paused
- **Closed** - Position filled

---

## Candidate Management

### Features
- ✅ **Manual Entry** - Add candidates with full details
- ✅ **Bulk Resume Upload** - Upload multiple resumes (PDF/DOCX)
- ✅ **Automatic Data Extraction** - AI-powered resume parsing
- ✅ **Edit Candidate Info** - Update candidate details
- ✅ **Delete Candidates** - Remove candidates (Admin only)
- ✅ **Advanced Search** - Multi-criteria filtering
- ✅ **Export to CSV** - Download candidate database

### Manual Entry Fields
- Name
- Email Address
- Contact Number
- Qualification
- Industry Sector
- Current Designation
- Department
- Current Location
- Current CTC (₹ LPA)
- Years of Experience
- Expected CTC (₹ LPA)
- Notice Period
- Position Association

### Bulk Resume Upload

**Supported Formats:**
- PDF (.pdf)
- Microsoft Word (.docx)

**Automatically Extracted Data:**
- ✅ Candidate Name
- ✅ Email Address
- ✅ Phone Number
- ✅ Years of Experience
- ✅ Current Designation (job title)
- ✅ Current Location (city)
- ✅ Technical Skills (auto-detected)

**Process:**
1. Select position for candidates
2. Upload multiple resume files
3. System parses each resume
4. Extracts candidate information
5. Creates candidate records automatically
6. Returns success/failure report

**Features:**
- Duplicate email detection
- Skill keyword recognition
- Experience calculation
- Location extraction
- Designation parsing

### Advanced Search

**Search Filters:**
- Keywords (name, designation, department)
- Current City
- Minimum Experience
- Maximum Experience
- Minimum Salary
- Maximum Salary
- Qualification
- Industry
- Department
- Designation
- Gender
- Language

### Candidate Status Tracking
- **Sourced** - Initial state
- **Shortlisted** - Reviewed by recruiter
- **Approved** - Ready to share with client
- **Rejected** - Not suitable (with reason)
- **Shared with Client** - Sent to client
- **Client Review** - Awaiting client feedback
- **Interview Scheduled** - Interview arranged
- **Selected** - Client selected
- **On Hold** - Decision pending
- **No Action** - No response from client

---

## Profile Review & Workflow

### Features
- ✅ **Review Pending Profiles** - View sourced/shortlisted candidates
- ✅ **Shortlist Candidates** - Mark for review
- ✅ **Approve for Sharing** - Ready to send to client
- ✅ **Reject with Reason** - Mandatory rejection reason
- ✅ **View Complete Profile** - All candidate details

### Workflow Steps

1. **Recruiter Sources Candidate**
   - Adds candidate (manual or bulk)
   - Status: Sourced

2. **Recruiter Shortlists**
   - Reviews and shortlists
   - Status: Shortlisted

3. **Team Leader/Manager Reviews**
   - Approves or Rejects
   - If rejected: Must provide reason
   - Status: Approved or Rejected

4. **Approved Candidates**
   - Available in Profile Sharing
   - Ready to send to client

### Review Actions
- **Shortlist** - Mark for further review
- **Approve** - Ready to share
- **Reject** - Not suitable (reason required)

---

## Profile Sharing & Email

### Features
- ✅ **Select Multiple Candidates** - Checkbox selection
- ✅ **Generate PDF** - Professional candidate profiles
- ✅ **Hide Contact Details** - Privacy protection
- ✅ **Email Composition** - Pre-filled templates
- ✅ **SMTP Email Sending** - Real email delivery
- ✅ **PDF Attachment** - Automatic attachment
- ✅ **Client Email Auto-fill** - From client database
- ✅ **Audit Logging** - Track all sharing actions

### PDF Generation

**Features:**
- Professional layout
- Company branding
- Contact details hidden
- Clean formatting
- Multiple candidates per PDF

**Information Included:**
- Candidate Name
- Qualification
- Current Designation
- Department
- Industry
- Location
- Years of Experience
- Current CTC
- Expected CTC
- Notice Period

**Information Hidden:**
- Email Address
- Phone Number

**Note:** "Contact details available upon request"

### Email Sending Process

1. **Select Candidates**
   - Choose approved candidates
   - Multiple selection supported

2. **Generate PDF**
   - Automatically created
   - Contact details masked

3. **Compose Email**
   - Client emails pre-filled
   - Professional template
   - Editable subject and body

4. **Send Email**
   - Real SMTP delivery
   - PDF attached automatically
   - Status updated to "Shared with Client"

### Email Template

```
Subject: Candidate Profiles - [N] Candidate[s]

Dear Client,

Please find attached [N] candidate profile[s] for your review.

Best regards,
RecruitHub Team
```

### Confirmation Dialog
If only one candidate selected:
"You have selected only one profile. Do you want to proceed?"

---

## Interview Management

### Features
- ✅ **Schedule Interviews** - Book interview slots
- ✅ **Multiple Interview Modes** - Online/Face-to-face/Telephonic
- ✅ **Action Plan** - Interview preparation notes
- ✅ **Feedback Tracking** - Record interview feedback
- ✅ **Result Tracking** - Selected/Rejected/On Hold
- ✅ **Delete Interviews** - Remove interview records
- ✅ **Export to CSV** - Download interview data

### Interview Details
- Candidate Association
- Position Association
- Interview Mode (Online/Face-to-face/Telephonic)
- Interview Date & Time
- Action Plan (preparation notes)
- Feedback (post-interview)
- Result (Selected/Rejected/On Hold)
- Scheduled By (user)

### Interview Modes
- **Online** - Video/Virtual interview
- **Face-to-Face** - In-person interview
- **Telephonic** - Phone interview

---

## User Management

### Features
- ✅ **Create Users** - Add new system users
- ✅ **Assign Roles** - Admin/Manager/Team Leader/Recruiter
- ✅ **View User List** - All system users
- ✅ **Delete Users** - Remove users (Admin only)
- ✅ **Export to CSV** - Download user list

### User Roles
- Admin
- Manager
- Team Leader
- Recruiter

### Access
- **Create Users:** Admin, Manager
- **View Users:** Admin, Manager
- **Delete Users:** Admin only (cannot delete self)

---

## Email Configuration

### Features
- ✅ **SMTP Configuration** - Configure email server
- ✅ **Quick Presets** - Gmail, Outlook, Office 365
- ✅ **Test Email** - Verify configuration
- ✅ **Secure Storage** - Encrypted credentials

### Supported Email Providers
- **Gmail** (App Password required)
- **Outlook/Hotmail**
- **Office 365**
- **Custom SMTP** (any provider)

### Configuration Fields
- SMTP Host (e.g., smtp.gmail.com)
- SMTP Port (typically 587 or 465)
- SMTP Username (email address)
- SMTP Password (app password for Gmail)
- From Email Address
- Use TLS (encryption)

### Gmail Setup Instructions

1. **Enable 2-Step Verification**
   - Go to Google Account Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Security Settings
   - Select "App passwords"
   - Choose "Mail" as app
   - Generate password

3. **Use in RecruitHub**
   - SMTP Host: smtp.gmail.com
   - SMTP Port: 587
   - Username: your-email@gmail.com
   - Password: [generated app password]
   - Use TLS: Yes

### Access
- **Configure Email:** Admin only
- **Send Email:** Admin, Manager, Team Leader

---

## Data Export (CSV)

### Features
- ✅ **Export Clients** - Complete client database
- ✅ **Export Positions** - All position details
- ✅ **Export Candidates** - Full candidate database
- ✅ **Export Interviews** - Interview records
- ✅ **Export Users** - User list (Admin/Manager)

### Export Format
- CSV (Comma-Separated Values)
- Compatible with Excel, Google Sheets
- UTF-8 encoding
- All fields included
- Ready for analysis

### Use Cases
- Data backup
- Reporting and analytics
- External system integration
- Compliance and auditing
- Offline access

---

## Advanced Features

### 1. Resume Parsing Intelligence

**Extraction Capabilities:**
- Name recognition (first non-header line)
- Email pattern matching
- Phone number formats (multiple patterns)
- Experience calculation
- Skill detection (50+ technologies)
- Designation extraction (30+ job titles)
- Location identification (Indian cities)

**Supported Skills:**
Python, Java, JavaScript, React, Angular, Node.js, MongoDB, SQL, AWS, Azure, Docker, Kubernetes, Git, Agile, Scrum, Machine Learning, AI, Data Science, C++, C#, .NET, PHP, Ruby, Go, Swift, Kotlin, TypeScript, HTML, CSS, REST API, GraphQL, Redis, PostgreSQL, MySQL, FastAPI, Django, Flask

**Common Designations:**
Software Engineer, Senior Software Engineer, Lead Engineer, Tech Lead, Full Stack Developer, Frontend Developer, Backend Developer, DevOps Engineer, Data Scientist, Data Analyst, Business Analyst, Project Manager, Product Manager, Scrum Master, UI/UX Designer, QA Engineer, System Administrator, Database Administrator, Network Engineer, Security Analyst

### 2. Role-Based Access Control (RBAC)

**Implementation:**
- JWT Token Authentication
- Role stored in token payload
- Backend middleware validation
- Frontend route protection
- API endpoint restrictions

**Security Features:**
- Password hashing (bcrypt)
- Token expiration (24 hours)
- Secure token storage
- CORS protection
- Input validation

### 3. Audit Logging

**Logged Actions:**
- Profile sharing to clients
- Email sending
- User login
- Data modifications

**Audit Information:**
- User who performed action
- Timestamp
- Action type
- Affected records

### 4. Cascade Protection

**Delete Restrictions:**
- Cannot delete client with positions
- Cannot delete position with candidates
- Cannot delete self (user)

**Benefits:**
- Data integrity
- Prevent accidental deletions
- Maintain relationships

### 5. Status Management

**Automatic Status Updates:**
- Candidate approved → Available for sharing
- Profile shared → Status updated
- Interview scheduled → Status changed
- Email sent → Marked as shared

---

## Workflow Examples

### Complete Recruitment Workflow

```
1. SETUP
   Admin → Configure Email Settings
   Admin → Create Users (Managers, TLs, Recruiters)
   Manager → Add Clients

2. JOB POSTING
   Manager → Create Position
   Manager → Assign Recruiters to Position

3. CANDIDATE SOURCING
   Recruiter → Upload Bulk Resumes (PDF/DOCX)
   System → Auto-extracts candidate details
   OR
   Recruiter → Manually add candidates

4. SCREENING
   Recruiter → Reviews candidates
   Recruiter → Shortlists suitable candidates

5. APPROVAL
   Team Leader/Manager → Reviews shortlisted
   TL/Manager → Approves or Rejects (with reason)

6. CLIENT SHARING
   Manager/TL → Selects approved candidates
   System → Generates PDF (hides contacts)
   Manager/TL → Composes email
   System → Sends email with PDF
   System → Marks as "Shared with Client"

7. INTERVIEW
   Manager/TL → Schedules interview
   System → Updates candidate status
   Manager/TL → Records feedback

8. SELECTION
   Manager → Updates final status
   Manager → Sends offer (if selected)

9. REPORTING
   Admin → Exports data to CSV
   Admin → Analyzes recruitment metrics
```

### Bulk Resume Upload Workflow

```
1. PREPARATION
   Recruiter → Collects resumes from job portals
   Recruiter → Organizes by position

2. UPLOAD
   Recruiter → Opens Candidates page
   Recruiter → Clicks "Add Candidate"
   Recruiter → Selects "Bulk Upload Resumes" tab
   Recruiter → Selects position
   Recruiter → Uploads multiple PDFs/DOCXs

3. PROCESSING
   System → Parses each resume
   System → Extracts: name, email, phone, experience, designation, location
   System → Checks for duplicates
   System → Creates candidate records

4. RESULTS
   System → Shows success count
   System → Lists failed uploads with reasons
   Recruiter → Reviews and updates missing fields

5. NEXT STEPS
   Recruiter → Reviews auto-populated data
   Recruiter → Updates missing information
   Recruiter → Shortlists candidates for review
```

---

## Best Practices

### For Recruiters
- ✅ Use bulk upload for efficiency
- ✅ Review auto-extracted data
- ✅ Add missing fields promptly
- ✅ Shortlist only qualified candidates
- ✅ Keep candidate status updated

### For Team Leaders
- ✅ Review shortlisted candidates daily
- ✅ Provide detailed rejection reasons
- ✅ Share profiles within 24 hours of approval
- ✅ Schedule interviews promptly
- ✅ Record feedback immediately

### For Managers
- ✅ Monitor team performance
- ✅ Review all client communications
- ✅ Ensure quality of profiles shared
- ✅ Track interview conversion rates
- ✅ Export data for reporting

### For Admins
- ✅ Configure email settings correctly
- ✅ Test email functionality
- ✅ Create users with appropriate roles
- ✅ Regular data exports for backup
- ✅ Monitor system usage

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search Candidates | Ctrl/Cmd + K |
| Export CSV | Ctrl/Cmd + E |
| New Client | Ctrl/Cmd + Shift + C |
| New Position | Ctrl/Cmd + Shift + P |
| New Candidate | Ctrl/Cmd + Shift + A |

---

## Troubleshooting

### Email Not Sending
**Issue:** Email fails to send
**Solutions:**
1. Check SMTP configuration
2. Verify credentials (use app password for Gmail)
3. Ensure "Email not configured" message → Ask admin
4. Check internet connection
5. Verify client has valid email addresses

### Resume Parsing Incomplete
**Issue:** Some fields not extracted
**Solutions:**
1. Ensure resume is well-formatted
2. Use standard section headers
3. Manually fill missing fields
4. Consider manual entry for complex resumes

### Cannot Delete Client/Position
**Issue:** Delete operation blocked
**Solutions:**
1. Check for dependent records
2. Delete or reassign positions first
3. Delete or reassign candidates first
4. Contact admin for force delete

---

## Security & Privacy

### Data Protection
- ✅ Contact details hidden in client PDFs
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Secure SMTP credentials

### GDPR Compliance
- Right to access (candidates can request data)
- Right to deletion (admin can delete records)
- Data minimization (only necessary fields)
- Purpose limitation (recruitment only)
- Consent tracking (future enhancement)

---

## Future Enhancements

### Planned Features
- [ ] LLM-powered resume parsing
- [ ] AI candidate matching
- [ ] Calendar integration (Google/Outlook)
- [ ] Video interview integration
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Email templates library
- [ ] Automated follow-ups
- [ ] Client portal
- [ ] Candidate portal
- [ ] ATS integration
- [ ] Background verification
- [ ] Offer letter generation
- [ ] Onboarding workflow

---

## Support & Documentation

- **User Guide:** This document
- **API Documentation:** /docs endpoint
- **Video Tutorials:** Coming soon
- **Support Email:** support@recruithub.com
- **Community Forum:** Coming soon

---

**Version:** 2.0  
**Last Updated:** January 2025  
**Document Owner:** RecruitHub Development Team
