# Sandbox API

> A sandboxed API built with microservices

### Description
A simple API (still a work in progress) to use in conjuction with other (front-end) projects.
The API currently consists of endpoints for basic user management, which does include uploading
profile, or avatar, images.

Much of the focus of this project has also been on testing &mdash; unit, integration, and acceptance testing.  Although more tests will be included as the work on this project progresses.

#### Requirements
The API is built with [node](https://nodejs.org) and utilizes mongodb as the data store. It is implemented
with containers, so [docker](https://www.docker.com) is required.
__________
## Install
To install the required dependencies, simply run:

```
yarn install
```

## Run
After installing the dependencies, simply run:
```
yarn up:dev
```

to launch the API.  This command will spin up the necessary containers and seed the database with a few users and default avatar image before launching the node app.

Once the containers are running, they can be stopped with `CTRL-C` and then completely shutdown by running:
```
yarn down
```

__________
## Endpoints

_TODO_ write up all the endpoints with a brief description of each