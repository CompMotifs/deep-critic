"""
Application configuration constants
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Application name
APP_NAME = "Deep Critic"

# API prefix for all routes
API_PREFIX = "/api"

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Debug mode
DEBUG = os.getenv("DEBUG", "False").lower() in ["true", "1", "yes"]