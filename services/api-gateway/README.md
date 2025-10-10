# API Gateway Service

## Development Commands

### Update Dependencies

```shell
# Make sure you are in the api-gateway service's directory
% pwd
/venomous-dashboard/services/api-gateway

# Install or update dependencies
% go get <packages>
% go mod tidy

# Move to the root directory
% cd ..
% pwd
/venomous-dashboard/services/api-gateway

# Run script to build and start the api-gateway service's container
% make setup SERVICE=api-gateway
```
