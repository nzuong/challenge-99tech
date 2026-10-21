# Problem 3: Debug API Issue

# Step 1: Identify the issue

## 1. Initial investigation

I normally start from docker-compose, identifying the list of services in-use, the dependency between them, and the configuration of each service. This helps me understand the overall architecture and pinpoint potential sources of the API issue.

In this case, I determine that the API service is dependent on Redis, Postgres and this services is expose via nginx. This means any issue with Redis, Postgres, or nginx could potentially affect the API service, so I need to investigate each of these components to identify the root cause of the problem. Next, I go quickly through the api service to find the environment variables that are needed and ensured they are set. 

## 2. Investigate components

I start by checking the status and configuration of each dependency. For Redis, I ensure that the service is running and accessible from the API service. I also check the connection settings in the API service to make sure they match the Redis configuration.

For Postgres, I verify that the database is up and running, and that the API service has the correct credentials and connection details. I also check for any network issues that might prevent the API service from reaching the database.

For nginx, I review the configuration to ensure that it correctly routes requests to the API service. I also check the logs for any errors or misconfigurations that could be affecting the API service's availability.

### 2.1 Redis

I check the Redis service to ensure it is running and accessible from the API service. I also verify the connection settings in the API service to make sure they match the Redis configuration. Any mismatch or connectivity issue here could lead to API failures.

### 2.2 Postgres
 - init.sql is included in the repo but not mounted to the Postgres container. It is not mounted to the container and therefore not executed during container startup.
 - POSTGRES_PASSWORD is set as raw text in the environment variables, potential security risk.

### 2.3 Nginx
 - `/api/` is routed to api port 3001 is wrong. It should be routed to port 3000.
 - `/api` is preferred over `/api/`
 - `/` is routed to a static response "Welcome to the platform\n".  I would redirect it to `/status` instead to provide a more meaningful response.

### 2.4 API Service
 - Connection details for Redis and Postgres are hard-coded into index.js. It is better to use environment variables for these configurations to improve security and flexibility.
 - The API service should also handle connection errors gracefully and provide meaningful error messages to aid in debugging and maintenance.
 - `/api/users` endpoint should return a list of users. Right now it returning datetime for db. I will change the path to `/api/now` for the sake of having api response.
 - Each request to `/api/now` endpoint opens a new connection to the database to fetch the current datetime. This is huge mistake, a connection pool should be opened already before handling requests and reused for subsequent queries.
 - In case the init.sql file is used (2.2), it configured maximum connections for the database. Once this number is reached, failure will occur for any new connection attempts. This highlights the importance of using a connection pool to manage database connections efficiently.
 

# 3. Proposed Solution

To address the issues identified, I propose the following changes:

- Update the API service to use environment variables for Redis and Postgres connection details.
- Implement a connection pool for Postgres to manage database connections efficiently.
- Modify the `/api/users` endpoint to `/api/now` to reflect its actual functionality.
- Ensure that the API service handles connection errors gracefully and provides meaningful error messages.
- Implement graceful shutdown handling in the API service to properly close database and Redis connections.
- Review and update the nginx configuration to correctly route requests to the API service and provide meaningful responses for the root path.

Changes have been modified directly into the src code.

# 4. Other improvements for production

In case of production deployment, it is important to consider the following aspects:

- Implement monitoring and alerting for the API service, Redis, and Postgres to quickly detect and respond to issues.
- Use environment variables for all sensitive configurations to enhance security.
- Implement proper logging for the API service to facilitate debugging and maintenance.
- Use framework and libraries for handle database connections and queries efficiently
- Add authentication, authorization, and role-based access control to secure the API endpoints.
- Configure nginx properly to handle reverse proxying, load balancing, and secure communication with the API service.
- Separate database, credential in postgres instead of default user and database
- Use .env file together with dotenv package of nodejs to load environment variables into the application.


