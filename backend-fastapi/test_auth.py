#!/usr/bin/env python3
"""
Authentication System Test Script
Tests all authentication endpoints for the Car Rental DApp
"""

import requests
import json
import time
from typing import Dict, Optional

class AuthTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1"
        self.session = requests.Session()
        
    def test_health(self) -> bool:
        """Test if the API is running"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def register_user(self, username: str, email: str, password: str, display_name: str) -> Dict:
        """Register a new user"""
        data = {
            "username": username,
            "email": email,
            "password": password,
            "display_name": display_name
        }
        response = self.session.post(f"{self.api_url}/auth/register", json=data)
        return {"status_code": response.status_code, "data": response.json()}
    
    def login_user(self, username_or_email: str, password: str) -> Dict:
        """Login user and return token"""
        data = {
            "username_or_email": username_or_email,
            "password": password
        }
        response = self.session.post(f"{self.api_url}/auth/login", json=data)
        result = {"status_code": response.status_code, "data": response.json()}
        
        if response.status_code == 200:
            result["token"] = result["data"]["access_token"]
        return result
    
    def get_user_info(self, token: str) -> Dict:
        """Get current user information"""
        headers = {"Authorization": f"Bearer {token}"}
        response = self.session.get(f"{self.api_url}/auth/me", headers=headers)
        return {"status_code": response.status_code, "data": response.json()}
    
    def refresh_token(self, token: str) -> Dict:
        """Refresh access token"""
        headers = {"Authorization": f"Bearer {token}"}
        response = self.session.post(f"{self.api_url}/auth/refresh-token", headers=headers)
        result = {"status_code": response.status_code, "data": response.json()}
        
        if response.status_code == 200:
            result["new_token"] = result["data"]["access_token"]
        return result
    
    def change_password(self, token: str, current_password: str, new_password: str) -> Dict:
        """Change user password"""
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "current_password": current_password,
            "new_password": new_password
        }
        response = self.session.post(f"{self.api_url}/auth/change-password", json=data, headers=headers)
        return {"status_code": response.status_code, "data": response.json()}
    
    def connect_metamask(self, token: str, metamask_address: str) -> Dict:
        """Connect MetaMask wallet"""
        headers = {"Authorization": f"Bearer {token}"}
        data = {"metamask_address": metamask_address}
        response = self.session.post(f"{self.api_url}/auth/connect-metamask", json=data, headers=headers)
        return {"status_code": response.status_code, "data": response.json()}
    
    def disconnect_metamask(self, token: str) -> Dict:
        """Disconnect MetaMask wallet"""
        headers = {"Authorization": f"Bearer {token}"}
        response = self.session.post(f"{self.api_url}/auth/disconnect-metamask", headers=headers)
        return {"status_code": response.status_code, "data": response.json()}
    
    def get_admin_stats(self, admin_token: str) -> Dict:
        """Get user statistics (admin only)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = self.session.get(f"{self.api_url}/admin/stats", headers=headers)
        return {"status_code": response.status_code, "data": response.json()}
    
    def get_all_users(self, admin_token: str) -> Dict:
        """Get all users (admin only)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = self.session.get(f"{self.api_url}/admin/users", headers=headers)
        return {"status_code": response.status_code, "data": response.json()}
    
    def change_user_role(self, admin_token: str, user_id: int, new_role: str) -> Dict:
        """Change user role (admin only)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        params = {"new_role": new_role}
        response = self.session.post(f"{self.api_url}/admin/users/{user_id}/change-role", 
                                   headers=headers, params=params)
        return {"status_code": response.status_code, "data": response.json()}

def print_result(test_name: str, result: Dict, expected_status: int = 200):
    """Print test result"""
    status = result["status_code"]
    success = "✅" if status == expected_status else "❌"
    print(f"{success} {test_name}: HTTP {status}")
    
    if status != expected_status:
        print(f"   Expected: {expected_status}, Got: {status}")
        print(f"   Response: {json.dumps(result['data'], indent=2)}")
    else:
        # Print relevant info for successful tests
        data = result.get("data", {})
        if "message" in data:
            print(f"   Message: {data['message']}")
        if "user" in data:
            user = data["user"]
            print(f"   User: {user.get('username')} ({user.get('email')})")
        if "access_token" in data:
            print(f"   Token: {data['access_token'][:20]}...")
    print()

def main():
    print("🚀 Starting Authentication System Tests")
    print("=" * 50)
    
    tester = AuthTester()
    
    # Test 1: Health Check
    print("1. Testing API Health...")
    if not tester.test_health():
        print("❌ API is not running! Please start the backend.")
        return
    print("✅ API is running\n")
    
    # Test 2: User Registration
    print("2. Testing User Registration...")
    reg_result = tester.register_user(
        username="testusr",
        email="testusr@example.com", 
        password="testpass123",
        display_name="Test User"
    )
    print_result("User Registration", reg_result, 200)
    
    # Test 3: User Login
    print("3. Testing User Login...")
    login_result = tester.login_user("testusr", "testpass123")
    print_result("User Login", login_result, 200)
    
    if login_result["status_code"] != 200:
        print("❌ Cannot continue tests without valid login")
        return
    
    user_token = login_result["token"]
    
    # Test 4: Get User Info
    print("4. Testing Get User Info...")
    user_info = tester.get_user_info(user_token)  
    print_result("Get User Info", user_info, 200)
    
    # Test 5: Token Refresh
    print("5. Testing Token Refresh...")
    refresh_result = tester.refresh_token(user_token)
    print_result("Token Refresh", refresh_result, 200)
    
    # Test 6: Connect MetaMask
    print("6. Testing MetaMask Connection...")
    metamask_result = tester.connect_metamask(user_token, "0x742d35Cc6634C0532925a3b8D4c8e0B4BD2C6A3B")
    print_result("MetaMask Connection", metamask_result, 200)
    
    # Test 7: Change Password
    print("7. Testing Password Change...")
    pwd_result = tester.change_password(user_token, "testpass123", "newpass123")
    print_result("Password Change", pwd_result, 200)
    
    # Test 8: Login with New Password
    print("8. Testing Login with New Password...")
    new_login = tester.login_user("testusr", "newpass123")
    print_result("Login with New Password", new_login, 200)
    
    # Test 9: Admin Login
    print("9. Testing Admin Login...")
    admin_login = tester.login_user("adminuser", "admin123")
    print_result("Admin Login", admin_login, 200)
    
    if admin_login["status_code"] == 200:
        admin_token = admin_login["token"]
        
        # Test 10: Admin Stats
        print("10. Testing Admin Stats...")
        stats_result = tester.get_admin_stats(admin_token)
        print_result("Admin Stats", stats_result, 200)
        
        # Test 11: Get All Users
        print("11. Testing Get All Users...")
        users_result = tester.get_all_users(admin_token)
        print_result("Get All Users", users_result, 200)
    
    # Test 12: Disconnect MetaMask
    print("12. Testing MetaMask Disconnection...")
    if login_result["status_code"] == 200:
        fresh_token = tester.login_user("testusr", "newpass123")["token"]
        disconnect_result = tester.disconnect_metamask(fresh_token)
        print_result("MetaMask Disconnection", disconnect_result, 200)
    
    print("=" * 50)
    print("🎉 Authentication System Tests Completed!")

if __name__ == "__main__":
    main()
