# Office Management System using a Hybrid Architecture - Server and Serverless

API Architecture:
RESTful

Express Server
Responsible for CRUD and small workflows that takes less than 3 seconds

Serverless - AWS Lambda
To perform all sort of Asynchronous tasks
To perform cron jobs

Databases:
Mongodb and DynamoDB

Authentication
JWT based, User pool - Cognito

Deployment Technology
Docker and Docker Compose

Caching 
Redis

Event push and pull
SQS

File Management
S3