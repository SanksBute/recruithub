"""
Backend API Tests for RecruitHub - Recruitment Management Application
Tests: Authentication, Positions CRUD, Candidates CRUD, CSV Export
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://talentportal-10.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@recruitment.com"
ADMIN_PASSWORD = "Admin@123"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        
    def test_get_me_with_token(self):
        """Test getting current user with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get current user
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestPositions:
    """Positions CRUD tests"""
    
    def test_get_positions(self, auth_headers):
        """Test fetching all positions"""
        response = requests.get(f"{BASE_URL}/api/positions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} positions")
        
    def test_get_positions_structure(self, auth_headers):
        """Test positions response structure"""
        response = requests.get(f"{BASE_URL}/api/positions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            position = data[0]
            # Verify required fields exist
            assert "id" in position
            assert "job_title" in position
            assert "department" in position
            assert "location" in position
            assert "status" in position
            print(f"Position structure verified: {position['job_title']}")
            
    def test_update_position(self, auth_headers):
        """Test updating a position (Edit functionality)"""
        # First get existing positions
        response = requests.get(f"{BASE_URL}/api/positions", headers=auth_headers)
        positions = response.json()
        
        if len(positions) == 0:
            pytest.skip("No positions to update")
            
        position = positions[0]
        position_id = position["id"]
        
        # Prepare update payload
        update_payload = {
            "client_id": position["client_id"],
            "job_title": position["job_title"],
            "department": position["department"],
            "num_openings": position["num_openings"],
            "reason_for_hiring": position.get("reason_for_hiring", "Test update"),
            "team_size": position.get("team_size"),
            "location": position["location"],
            "work_mode": position["work_mode"],
            "working_days": position.get("working_days", "Monday-Friday"),
            "qualification": position["qualification"],
            "experience": position["experience"],
            "must_have_skills": position.get("must_have_skills", []),
            "good_to_have_skills": position.get("good_to_have_skills", []),
            "gender_preference": position.get("gender_preference", ""),
            "assigned_recruiters": position.get("assigned_recruiters", [])
        }
        
        # Update position
        response = requests.put(
            f"{BASE_URL}/api/positions/{position_id}",
            json=update_payload,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        updated = response.json()
        assert updated["id"] == position_id
        print(f"Position updated successfully: {updated['job_title']}")


class TestCandidates:
    """Candidates CRUD tests"""
    
    def test_get_candidates(self, auth_headers):
        """Test fetching all candidates"""
        response = requests.get(f"{BASE_URL}/api/candidates", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} candidates")
        
    def test_get_candidates_structure(self, auth_headers):
        """Test candidates response structure"""
        response = requests.get(f"{BASE_URL}/api/candidates", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            candidate = data[0]
            # Verify required fields exist
            assert "id" in candidate
            assert "name" in candidate
            assert "email" in candidate
            assert "contact_number" in candidate
            assert "status" in candidate
            print(f"Candidate structure verified: {candidate['name']}")
            
    def test_update_candidate(self, auth_headers):
        """Test updating a candidate (Edit functionality)"""
        # First get existing candidates
        response = requests.get(f"{BASE_URL}/api/candidates", headers=auth_headers)
        candidates = response.json()
        
        if len(candidates) == 0:
            pytest.skip("No candidates to update")
            
        candidate = candidates[0]
        candidate_id = candidate["id"]
        
        # Prepare update payload
        update_payload = {
            "position_id": candidate["position_id"],
            "name": candidate["name"],
            "email": candidate["email"],
            "contact_number": candidate["contact_number"],
            "qualification": candidate["qualification"],
            "industry_sector": candidate["industry_sector"],
            "current_designation": candidate["current_designation"],
            "department": candidate["department"],
            "current_location": candidate["current_location"],
            "current_ctc": candidate["current_ctc"],
            "years_of_experience": candidate["years_of_experience"],
            "expected_ctc": candidate["expected_ctc"],
            "notice_period": candidate["notice_period"]
        }
        
        # Update candidate
        response = requests.put(
            f"{BASE_URL}/api/candidates/{candidate_id}",
            json=update_payload,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        updated = response.json()
        assert updated["id"] == candidate_id
        print(f"Candidate updated successfully: {updated['name']}")


class TestCSVExport:
    """CSV Export endpoint tests"""
    
    def test_export_positions_csv(self, auth_headers):
        """Test exporting positions to CSV"""
        response = requests.get(
            f"{BASE_URL}/api/export/positions",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Export failed: {response.text}"
        assert "text/csv" in response.headers.get("content-type", "")
        assert "attachment" in response.headers.get("content-disposition", "")
        
        # Verify CSV content
        content = response.text
        assert "id" in content or "job_title" in content
        print(f"Positions CSV exported successfully, size: {len(content)} bytes")
        
    def test_export_candidates_csv(self, auth_headers):
        """Test exporting candidates to CSV"""
        response = requests.get(
            f"{BASE_URL}/api/export/candidates",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Export failed: {response.text}"
        assert "text/csv" in response.headers.get("content-type", "")
        assert "attachment" in response.headers.get("content-disposition", "")
        
        # Verify CSV content
        content = response.text
        assert "id" in content or "name" in content
        print(f"Candidates CSV exported successfully, size: {len(content)} bytes")


class TestDeleteOperations:
    """Delete operation tests - Admin only"""
    
    def test_delete_position_with_candidates_fails(self, auth_headers):
        """Test that deleting a position with candidates fails"""
        # Get positions
        response = requests.get(f"{BASE_URL}/api/positions", headers=auth_headers)
        positions = response.json()
        
        if len(positions) == 0:
            pytest.skip("No positions to test delete")
            
        # Get candidates to find a position with candidates
        candidates_response = requests.get(f"{BASE_URL}/api/candidates", headers=auth_headers)
        candidates = candidates_response.json()
        
        if len(candidates) == 0:
            pytest.skip("No candidates to test constraint")
            
        # Find a position that has candidates
        position_with_candidates = None
        for position in positions:
            for candidate in candidates:
                if candidate.get("position_id") == position["id"]:
                    position_with_candidates = position
                    break
            if position_with_candidates:
                break
                
        if not position_with_candidates:
            pytest.skip("No position with candidates found")
            
        # Try to delete - should fail
        response = requests.delete(
            f"{BASE_URL}/api/positions/{position_with_candidates['id']}",
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"Delete position with candidates correctly blocked")


class TestClients:
    """Clients endpoint tests"""
    
    def test_get_clients(self, auth_headers):
        """Test fetching all clients"""
        response = requests.get(f"{BASE_URL}/api/clients", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} clients")


class TestDashboard:
    """Dashboard stats tests"""
    
    def test_get_dashboard_stats(self, auth_headers):
        """Test fetching dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify stats structure for admin
        assert "total_clients" in data or "assigned_clients" in data
        print(f"Dashboard stats: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
