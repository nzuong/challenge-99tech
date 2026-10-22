# Problem 4:  Ship It Twice

Implement a automated pipeline with github action to deploy backend on ec2 with frontend on s3


# Assumption

I am going to make the following assumptions:
 - Backend will be deployed on an EC2 instance.
 - Frontend will be deployed on an S3 bucket.
 - GitHub Actions will be used to automate the deployment pipeline.
 - The backend API will be accessible via a domain name configured in Nginx. Nginx configuration are ready and out-of-scope for this problem.
 - The frontend will be served as a static website from S3.
 - Environment variables for the backend will be managed using a `.env` file on the EC2 instance.
 - Database or other backend services are external to the EC2 instance and connectivity are already configured.
 - Docker Compose is used to deploy the backend and Nginx services on the EC2 instance. (See `docker-compose.yaml`)
 - Watchtower is used to automatically update the backend whenever a new image is available on ECR.
 - ECR permission is configured to allow the EC2 instance to pull the backend image, and push from the CI/CD pipeline.
 - There is an external SonarQube server configured for code quality analysis.

# Solution
 Here are the flows for both backend and frontend deployment.

## Backend Deployment Flow
1. Code is pushed to the GitHub repository.
2. GitHub Actions workflow is triggered.
3. Run test and quality check with SonarQube
4. The workflow builds the Docker image for the backend.
5. The image is pushed to Amazon ECR.
6. Watchtower on the EC2 instance detects the new image and updates the backend container.

## Frontend Deployment Flow
1. Code is pushed to the GitHub repository.
2. GitHub Actions workflow is triggered.
3. Run test and quality check with SonarQube
4. The frontend docker image is built.
5. The frontend docker image is pushed to Amazon ECR.
6. The static files are extracted from the frontend docker image.
7. The static files are uploaded to the S3 bucket.
8. The S3 bucket serves the updated frontend as a static website.

# Pros and Cons

## Pros
- Using Docker ensures consistent environments for both backend and frontend deployments.
- Using Docker to build FE ensures consistent build environment and simplifies the extraction of static files for S3 deployment.
- Using Docker also allows easy scaling and deployment of services across different environments.
- Automated deployment reduces manual intervention and human error.
- CI/CD pipeline ensures code quality with SonarQube checks and fail-fast.
- Backend updates are handled automatically via Watchtower.
- No SSH access is required for deployments, reducing security risks.

## Cons
- Initial setup of GitHub Actions, ECR, S3, and EC2 can be complex.
- Debugging deployment issues may require knowledge of multiple services.
- Reliance on external services like SonarQube and AWS may introduce dependencies and potential points of failure.
- Watchtower introduces additional dependency and small delay in updating the backend container.
- Watchtower uses a floating tag like `latest` or `1.0` which can cause some difficulty for debugging.
# Other Considerations

- Ensure proper IAM roles and permissions are configured for both the EC2 instance and GitHub Actions to interact with AWS services.
- Monitor the deployment pipeline and set up alerts for failures or issues.
- Regularly update Docker images and dependencies to maintain security and performance.
- Consider implementing rollback strategies for both backend and frontend deployments in case of failures.
- Keep the `.env` file on the EC2 instance secure and manage sensitive information appropriately.
- Regularly review and rotate secrets and credentials used in the deployment pipeline to minimize security risks.

# Production consideration
- Zero-downtime: Having multiple instances
- Environment promote: Use a staging environment and production releases would be triggered by promoting tested sematic version tag like `1.x.y`
- CDN cache in front of S3