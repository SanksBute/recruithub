#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List

class RecruitmentAPITester:
    def __init__(self, base_url="https://talentportal-10.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_entities = {
            'clients': [],
            'positions': [],
            'candidates': [],
            'interviews': [],
            'users': []
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200) -> tuple:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic API health"""
        success, data = self.make_request('GET', '')
        self.log_test("API Health Check", success, f"Response: {data}")
        return success

    def test_admin_login(self):
        """Test admin login with default credentials"""
        login_data = {
            "email": "admin@recruitment.com",
            "password": "Admin@123"
        }
        
        success, data = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'token' in data:
            self.token = data['token']
            self.user_data = data['user']
            self.log_test("Admin Login", True, f"Role: {self.user_data.get('role')}")
            return True
        else:
            self.log_test("Admin Login", False, f"Response: {data}")
            return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, data = self.make_request('GET', 'auth/me')
        self.log_test("Get Current User", success, f"User: {data.get('name', 'Unknown')}")
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, data = self.make_request('GET', 'dashboard/stats')
        self.log_test("Dashboard Stats", success, f"Stats keys: {list(data.keys()) if success else 'Failed'}")
        return success

    def test_client_operations(self):
        """Test client CRUD operations"""
        # Create client
        client_data = {
            "client_name": "Test Tech Corp",
            "industry": "Technology",
            "organization_type": "Private Limited",
            "headquarter_location": "Mumbai, India",
            "other_branches": "Delhi, Bangalore",
            "website": "https://testtech.com",
            "core_business": "Software Development",
            "contact_emails": ["hr@testtech.com", "contact@testtech.com"]
        }
        
        success, data = self.make_request('POST', 'clients', client_data, 200)
        if success and 'id' in data:
            client_id = data['id']
            self.created_entities['clients'].append(client_id)
            self.log_test("Create Client", True, f"Client ID: {client_id}")
            
            # Get client
            success, data = self.make_request('GET', f'clients/{client_id}')
            self.log_test("Get Client", success, f"Name: {data.get('client_name', 'Unknown')}")
            
            # List clients
            success, data = self.make_request('GET', 'clients')
            self.log_test("List Clients", success, f"Count: {len(data) if success else 0}")
            
            return client_id if success else None
        else:
            self.log_test("Create Client", False, f"Response: {data}")
            return None

    def test_position_operations(self, client_id: str):
        """Test position CRUD operations"""
        if not client_id:
            self.log_test("Position Operations", False, "No client ID provided")
            return None
            
        position_data = {
            "client_id": client_id,
            "job_title": "Senior Software Engineer",
            "department": "Engineering",
            "num_openings": 2,
            "reason_for_hiring": "Team expansion",
            "team_size": 10,
            "location": "Mumbai",
            "work_mode": "hybrid",
            "working_days": "Monday to Friday",
            "qualification": "B.Tech/M.Tech in Computer Science",
            "experience": "3-5 years",
            "must_have_skills": ["Python", "React", "MongoDB"],
            "good_to_have_skills": ["Docker", "AWS"],
            "gender_preference": "",
            "assigned_recruiters": []
        }
        
        success, data = self.make_request('POST', 'positions', position_data, 200)
        if success and 'id' in data:
            position_id = data['id']
            self.created_entities['positions'].append(position_id)
            self.log_test("Create Position", True, f"Position ID: {position_id}")
            
            # Get position
            success, data = self.make_request('GET', f'positions/{position_id}')
            self.log_test("Get Position", success, f"Title: {data.get('job_title', 'Unknown')}")
            
            # List positions
            success, data = self.make_request('GET', 'positions')
            self.log_test("List Positions", success, f"Count: {len(data) if success else 0}")
            
            return position_id if success else None
        else:
            self.log_test("Create Position", False, f"Response: {data}")
            return None

    def test_candidate_operations(self, position_id: str):
        """Test candidate CRUD operations"""
        if not position_id:
            self.log_test("Candidate Operations", False, "No position ID provided")
            return None
            
        candidate_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "contact_number": "+91-9876543210",
            "qualification": "B.Tech Computer Science",
            "industry_sector": "Technology",
            "current_designation": "Software Engineer",
            "department": "Engineering",
            "current_location": "Mumbai",
            "current_ctc": 8.5,
            "years_of_experience": 3.5,
            "expected_ctc": 12.0,
            "notice_period": "30 days",
            "position_id": position_id
        }
        
        success, data = self.make_request('POST', 'candidates', candidate_data, 200)
        if success and 'id' in data:
            candidate_id = data['id']
            self.created_entities['candidates'].append(candidate_id)
            self.log_test("Create Candidate", True, f"Candidate ID: {candidate_id}")
            
            # Get candidate
            success, data = self.make_request('GET', f'candidates/{candidate_id}')
            self.log_test("Get Candidate", success, f"Name: {data.get('name', 'Unknown')}")
            
            # List candidates
            success, data = self.make_request('GET', 'candidates')
            self.log_test("List Candidates", success, f"Count: {len(data) if success else 0}")
            
            return candidate_id if success else None
        else:
            self.log_test("Create Candidate", False, f"Response: {data}")
            return None

    def test_candidate_search(self):
        """Test candidate search functionality"""
        search_params = {
            "keywords": "Software Engineer",
            "current_city": "Mumbai",
            "min_experience": 2.0,
            "max_experience": 5.0,
            "qualification": "B.Tech"
        }
        
        success, data = self.make_request('POST', 'candidates/search', search_params)
        self.log_test("Candidate Search", success, f"Results: {len(data) if success else 0}")
        return success

    def test_profile_review_workflow(self, candidate_id: str):
        """Test profile review actions"""
        if not candidate_id:
            self.log_test("Profile Review", False, "No candidate ID provided")
            return False
            
        # Test shortlist action
        action_data = {
            "candidate_id": candidate_id,
            "action": "shortlist"
        }
        
        success, data = self.make_request('POST', f'candidates/{candidate_id}/action', action_data)
        self.log_test("Shortlist Candidate", success, f"Response: {data.get('message', 'Unknown')}")
        
        # Test approve action
        action_data["action"] = "approve"
        success, data = self.make_request('POST', f'candidates/{candidate_id}/action', action_data)
        self.log_test("Approve Candidate", success, f"Response: {data.get('message', 'Unknown')}")
        
        return success

    def test_pdf_generation(self, candidate_id: str):
        """Test PDF generation for candidates"""
        if not candidate_id:
            self.log_test("PDF Generation", False, "No candidate ID provided")
            return False
            
        success, data = self.make_request('POST', 'candidates/generate-pdf', [candidate_id])
        
        if success and 'pdf_base64' in data:
            self.log_test("PDF Generation", True, f"PDF size: {len(data['pdf_base64'])} chars")
            return True
        else:
            self.log_test("PDF Generation", False, f"Response: {data}")
            return False

    def test_email_draft_creation(self, candidate_id: str):
        """Test email draft creation"""
        if not candidate_id:
            self.log_test("Email Draft", False, "No candidate ID provided")
            return False
            
        email_data = {
            "to": ["client@example.com"],
            "subject": "Candidate Profile - John Doe",
            "body": "Please find the candidate profile attached.",
            "candidate_ids": [candidate_id]
        }
        
        success, data = self.make_request('POST', 'candidates/share-email-draft', email_data)
        self.log_test("Email Draft Creation", success, f"Response: {data.get('message', 'Unknown')}")
        return success

    def test_interview_scheduling(self, candidate_id: str, position_id: str):
        """Test interview scheduling"""
        if not candidate_id or not position_id:
            self.log_test("Interview Scheduling", False, "Missing candidate or position ID")
            return None
            
        # Schedule interview for tomorrow
        interview_date = (datetime.now() + timedelta(days=1)).isoformat()
        
        interview_data = {
            "candidate_id": candidate_id,
            "position_id": position_id,
            "interview_mode": "online",
            "interview_date": interview_date,
            "action_plan": "Technical round with team lead"
        }
        
        success, data = self.make_request('POST', 'interviews', interview_data, 200)
        if success and 'id' in data:
            interview_id = data['id']
            self.created_entities['interviews'].append(interview_id)
            self.log_test("Schedule Interview", True, f"Interview ID: {interview_id}")
            
            # List interviews
            success, data = self.make_request('GET', 'interviews')
            self.log_test("List Interviews", success, f"Count: {len(data) if success else 0}")
            
            return interview_id
        else:
            self.log_test("Schedule Interview", False, f"Response: {data}")
            return None

    def test_user_management(self):
        """Test user management operations"""
        # List users
        success, data = self.make_request('GET', 'users')
        self.log_test("List Users", success, f"Count: {len(data) if success else 0}")
        
        # Create new user
        user_data = {
            "email": "test.recruiter@example.com",
            "password": "TestPass123!",
            "name": "Test Recruiter",
            "role": "recruiter"
        }
        
        success, data = self.make_request('POST', 'auth/register', user_data, 200)
        if success:
            self.log_test("Create User", True, f"User: {data.get('user', {}).get('name', 'Unknown')}")
            if 'user' in data and 'id' in data['user']:
                self.created_entities['users'].append(data['user']['id'])
        else:
            self.log_test("Create User", False, f"Response: {data}")
        
        return success

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Recruitment Management API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ API is not accessible. Stopping tests.")
            return False
            
        # Authentication
        if not self.test_admin_login():
            print("❌ Authentication failed. Stopping tests.")
            return False
            
        self.test_get_current_user()
        self.test_dashboard_stats()
        
        # Core workflow tests
        client_id = self.test_client_operations()
        position_id = self.test_position_operations(client_id)
        candidate_id = self.test_candidate_operations(position_id)
        
        # Advanced features
        self.test_candidate_search()
        self.test_profile_review_workflow(candidate_id)
        self.test_pdf_generation(candidate_id)
        self.test_email_draft_creation(candidate_id)
        self.test_interview_scheduling(candidate_id, position_id)
        self.test_user_management()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.created_entities['clients']:
            print(f"\n📝 Created Entities:")
            for entity_type, ids in self.created_entities.items():
                if ids:
                    print(f"   {entity_type.title()}: {len(ids)} created")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = RecruitmentAPITester()
    
    try:
        success = tester.run_comprehensive_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())