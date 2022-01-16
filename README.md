# Shopify-Developer-Challenge

This is my submission for the 2022 shopify backend developer challenge (https://madhu-shopify-challenge.herokuapp.com/). The project is primarily a backend project built with node.js and express.js that acts an an inventory management service. The backend interacts with a mongoDB database for storage and uses cloudinary for image upload and thumbnail generation. It also has a frontend component that is mainly used to demo and test the backend. 

Note: The frontend is was not thoroughly tested and may have bugs, it is primarily meant as a method to test the backend and its ability to handle different types of requests. The frontend is built with react.

## Instructions on how to use

### Demo version 
**The frontend and backend of the project can easily be accessed at https://madhu-shopify-challenge.herokuapp.com/. You can freely use this url if you would like to test the app in any way.**

### Local setup 

Prerequisites:

- Have Node.js installed
- Create a cloudinary account at https://cloudinary.com/users/register/free
- Create a mongodb account and then create a mongodb cluster which will be used as the project database, this can be done at https://www.mongodb.com/cloud/atlas/register/

Instructions:

1. Clone this repository
2. Run `npm install` in project root to install dependencies, `cd` into the client folder and run `npm install` again to install client dependencies. Then cd back into the project root. 
3. Create a .env file in the project root and add the following fields by using the keys from the mongodb and cloudinary account. 






## What does it do

This is an inventory management app where users can create, read, update and delete inventory items. The bonus component I added is image upload and thumbnail generation where users can upload images as part of their inventory item and the backend automatically generates a thumbnail from that image which will be linked to the inventory item. 

## Tech stack

Back end service is built with Node.js and express.js framework. The inventory items are stored and retrieved from a MongoDB database. The cloudinary API is used for image storage, thumbnail generation and image hosting. Url's from cloudinary are then stored on MongoDB so that the image can be accessed. I used Jest for unit testing and the app is hosted using Heroku. 
