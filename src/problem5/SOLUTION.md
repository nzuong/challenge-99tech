Problem 5: Fortify The Castle

I will secure the system built in problem 1 and additional change that I think is necessary to fortify the overall architecture.



# Solution

RBAC (Role-Based Access Control) is a strictly required feature for any system, not to mention a sensitive financial system like this one. It ensures that users can only perform actions that they are authorized to do, reducing the risk of unauthorized access and potential security breaches.

## LoadBalancer

In the real world, bots or trading tools are used to send orders to the system at a high frequency, running Order Ingestion Service behind NGINX can become a bottleneck. To handle this, I will put the Order Ingestion Service behind the NLB directly, bypassing NGINX for high-frequency order traffic. This will help distribute the load more efficiently and reduce latency for order processing.

## Amazon Cognito or Keycloak
I will use Amazon Cognito or Keycloak to manage user authentication and authorization. These services provide robust support for RBAC, allowing me to define roles and permissions for different types of users (e.g., traders, administrators). Integration with the existing ECS services will ensure that only authorized users can access specific endpoints and perform certain actions.


## Order Ingestion Service

Since we are introducting RBAC with Amazon Cognito or Keycloak, we need to ensure that the load balancer correctly forwards authentication headers to the backend services. This will allow the services to enforce access control based on the user's role and permissions. Order Ingestion Service needs to run sidecar containers to handle authentication and authorization, ensuring that only valid requests from authenticated users are processed.

User authenticate to the service through Amazon Cognito or Keycloak, obtaining a token that includes their roles and permissions. This token is then included in the request headers when interacting with the Order Ingestion Service. The sidecar container validates the token and enforces access control based on the user's role, ensuring that only authorized users can perform specific actions.


The policy can be stored in a centralized location such as S3 so that in case of scaling, new instances of the Order Ingestion Service can retrieve the latest access control policies and enforce them consistently. This ensures that all instances adhere to the same security rules and that access control remains effective even as the system scales horizontally.