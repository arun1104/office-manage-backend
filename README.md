# Office Management System using a Hybrid Architecture - Server and Serverless

This is the backend system completely responsible for managing an entire office like Task workflows, User onboarding, Task Automation, Invoicing and Billing, Leavd and Attendance Management.

For better performance it will be using Redis. 
Any time consuming task will be send out as an Event to SQS and it will be executed by Lambda functions.
Both Server and Lambda has access to all the cloud resources.

# API Architecture:
RESTful

# Express Server
Responsible for CRUD and small workflows that takes less than 3 seconds

# Serverless - AWS Lambda
To perform all sort of Asynchronous tasks
To perform cron jobs

# Databases:
Mongodb and DynamoDB

# Authentication
JWT based, User pool - Cognito

# Deployment Technology
Docker and Docker Compose

# Caching 
Redis

# Event push and pull
SQS

# File Management
S3