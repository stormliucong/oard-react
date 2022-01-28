# OARD : An Open Real-world based Annotation for Rare Diseases and its Associated Phenotypes
This is a React web app to serve the web app of OARD. The backend is provided by OARD Api. Currently it is hosted on the 
[NCATS AWS server (https://rare.cohd.io/)](https://rare.cohd.io/)


## Requirements
You need to install three packages on your machine:
* [Npm](https://docs.npmjs.com/) : The package manager for the Node JavaScript platform. 
* [Node.js](https://nodejs.org/en/): The JavaScript runtime that you will use to run your frontend project.
* [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable): A package and project manager for Node.js applications.

## Installation on Ubuntu
```sh
git clone https://github.com/stormliucong/oard-react.git
cd oard-react
npm install # install dependencies
yarn build
```

## Deploying on Nginx
Assuming you have your React application in the `/var/cohd-rare/oard-react` directory, change the **root** configuration in `/etc/nginx/sites-available/cohd-rare` to:
```sh
server {
    
        location / {
                root /var/cohd-rare/oard-react/build/;
                index index.html;
                try_files $uri $uri/ =404;
        }
        
}
```
## Reference
https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project

## To Do List
1. Create tables for different analysis
2. Clean up nav and headers

