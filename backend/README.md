# Skyramp Sample Store API

## Run Server API 
To run the sample Store API server:

1. Build the Docker image:
   ```
   docker compose build api-sample
   ```

2. Start the Docker container:
   ```
   docker compose up -d
   ```

The API server will now be running in a Docker container.

## Install as K8s resources on local cluster

1. Create kind cluster
   ```
   kind create cluster -n local-kind
   ```
2. Build local images
   ```
   docker build . -t api-insight:v1.0
   docker build init_data -f init_data/Dockerfile -t init-data:v1.0
   ```
3. Load local images to kind cluster
   ```
   kind load docker-image init-data:v1.0 --name local-kind
   kind load docker-image api-insight:v1.0 --name local-kind
   ```
4. Install using Helm
   ```
   helm install api-insight ./charts/api-insight
   ```
   
   api-insight will fail initially because it waits for redis to get ready. Once redis svc is up and running, api-insight will be ready state.

## Test the API
To test and explore the Store API endpoints:

1. Ensure the API server is running (see steps above)

2. Open your web browser and navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

3. You will see the Swagger UI which provides an interactive interface to test the various API endpoints

4. Expand the endpoint sections to see details on required parameters and response formats

5. Click the "Try it out" button to enter parameters and execute requests against the running API server

6. Register a user using /api/v1/register Endpoint

7. Login using /api/v1/login Endpoint

8. Use the token to make requests to other endpoints

Testing Matrix (Manual and local testing):  
|Endpoints|Test|Framework|Language|Status|
|-----------|------|-----------|----------|------|
| api/v1/products | contract | pytest | python | :white_check_mark: |
||| robot | python | :white_check_mark: |
||| playwright | typescript | :white_check_mark: |
||| playwright | javascript | :x: |
|api/v1/products|smoke| pytest | python | :white_check_mark: |
||| robot | python | :white_check_mark: |
||| playwright | typescript | :white_check_mark: |
||| playwright | javascript | :x: |
| api/v1/products | fuzz | robot | python | :white_check_mark: |
||| pytest | python | :white_check_mark: |
||| playwright | typescript | Not supported |
||| playwright | javascript | Not supported |
| api/v1/orders | contract | pytest | python | :white_check_mark: |
||| robot | python | :white_check_mark: |
||| playwright | typescript | :white_check_mark: |
||| playwright | javascript | :x: |
| api/v1/orders | smoke | pytest | python | :white_check_mark: |
||| robot | python | :white_check_mark: |
||| playwright | typescript | :white_check_mark: |
||| playwright | javascript | :x: |
| api/v1/orders | fuzz | robot | python | :white_check_mark: |
||| pytest | python | :white_check_mark: |
||| playwright | typescript | Not supported |
||| playwright | javascript | Not supported |
| api/v1/products/{product_id}/reviews | contract | pytest | python | :white_check_mark: |
||| robot | python | :white_check_mark: |
||| playwright | typescript | :white_check_mark: |
||| playwright | javascript | :x: |
| api/v1/products/{product_id}/reviews | smoke | pytest | python | :white_check_mark: |
||| robot | python | :white_check_mark: |
||| playwright | typescript | :white_check_mark: |
||| playwright | javascript | :x: |
| api/v1/products/{product_id}/reviews | fuzz | robot | python | :white_check_mark: |
||| pytest | python | :white_check_mark: |
||| playwright | typescript | Not supported |
||| playwright | javascript | Not supported |


This allows you to test the functionality of the Store API and ensures it is working as expected before integrating it into other applications.