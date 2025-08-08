# API Specification

Based on your REST + WebSocket approach and the data models we've defined, this comprehensive API specification supports DirectDrive Authority Engine's real-time citation monitoring and n8n workflow integration.

## REST API Specification

All API endpoints follow RESTful conventions with JSON request/response format. Authentication uses Supabase JWT tokens for secure access to DirectDrive data and future client data isolation.

**Base URL:** `https://directdrive-authority.vercel.app/api/v1`  
**Authentication:** Bearer token (Supabase JWT)  
**Content-Type:** `application/json`

## Core API Endpoints

### Keywords Management
```yaml