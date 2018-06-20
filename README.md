# Getting Started
* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Instruction](#instruction)
* [Understanding the code](#understanding-the-code)
  * [Server](#server)
  * [Routes](#routes)
  * [Twitter Apps](#twitter-apps)
  * [Watson Personality Insights](#watson-personality-insights)
  * [MongoDB Models](#mongodb-models)
  * [Angular](#angular)
* [Suggestions](#suggestions-for-improvements)

# Overview 
This is a project done by penultimate year students from Imperial College London in collaboration with IBM to build a turn-based spaceship game that runs by voice commands. The followings are used to develop the game:

1. MEAN Application that runs on IBM cloud. SocketIO is used to allow real-time data exchange between the MEAN app on the cloud and the Raspberry Pi. 

2. Raspberry Pi 3 B+ that runs Node.js on Raspbian Stretch OS.  Read [here](https://github.com/CliveWongTohSoon/IBMRasberry.git) to learn more about how to configure the Raspberry Pi, which works together with the MEAN app in this repository. 

This repository will guide you on setting up MEAN Web App with the use of SocketIO, and using IBM Watson Personality Insights API and deploying MEAN Web App onto IBM Cloud. 

# Prerequisites
To run this project locally, you will need to install:  
1. [Node.js](https://nodejs.org/en/download/) 
2. [MongoDB](https://docs.mongodb.com/manual/installation/)
3. [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)
4. [Twitter Apps Account](https://apps.twitter.com/)

It is required to create an account for [MongoDB](https://cloud.mongodb.com/), [IBM Cloud](https://www.ibm.com/cloud/) and a [Twitter](https://apps.twitter.com) account in order to manage database on the cloud, and deploy the MEAN web app onto IBM Cloud. Also, basic knowledge of Angular and Javascript are needed. 

# Instruction
You may host the web app locally by first installing required package, and then start hosting:
```
$ npm install
$ npm start
```
and, on a separate terminal, execute:
```
$ npm run build
```
to build the MEAN App into bundle.js in the directory *public*. The MEAN web app is essentially "bundled" up by webpack into this directory.

# Understanding the code
The MEAN web app is modularised into several parts:

## Server
Files associated:
* app.js
* bin/www 

app.js is the configuration file of the server. When *npm start* is executed, it executes: 
```
node ./bin/www
```
This can be seen in *package.json*, where it is written as a script (under scripts). 

Inside app.js, it includes settings for the http [routes](#routes) and connections to mongoDB. Ultimately, app.js will be exported to bin/www, which sets up the port and listening to it. Therefore, app.js and bin/www essentially make up the server. SocketIO server is also set up in the www file, which in charge of the communication between the program running on the front end Angular and the Raspberry Pi. SocketIO is used instead of http because it allows real-time exchange to data between Angular front end and Raspberry Pi.  

## Routes
Files associated:
* routes/app.js
* routes/twitRouter.js
* views/index.hbs

In the directory routes, app.js is responsible of rendering the entry page index.hbs when the route "/" is called. It also contains the api for http get request to the route "/introduction". This route will be called after twitter account is logged in (as calllback redirect) as shown in twitRouter.js, and the user details will be parsed to the request. The user detail is then cached by the variable *cachedUser*. This cached user detail is then returned to the Angular front end via http get request from the route "/getuser". The twitter user details is then used by IBM Watson Personality Insights. Since the twitter callback api redirects to the route "/introduction", it also renders the introduction page. This is an exception in this project where a page is rendered by http redirect instead of by the Angular router (Route "/introduction" also links to the introduction page rendered in the directory assets/app/introduction). 

Notice that, the exchange of data is done via SocketIO. With the use of SocketIO, it essentially replaces the need of API for http request from the Angular front end.

## Twitter Apps
Files associated:
* config/passport.js
* helpers/twitter-helper.js
* .env

This web app requires user to login via Twitter, in order to initialises the game. The user details returned by Twitter api will be used as the input to Watson Personality Insights. The use of Twitter API is done with the help of passport node package. You may read [this](http://docs.inboundnow.com/guide/create-twitter-application/) to learn how to create a Twitter App. Afterwards, fill in the credentials in .env file. The credentials will be used to initialise passport in passport.js file. Similarly, twitter-helper.js contains api that retrieves users tweets. Together, they return user's tweets, which will be used by [personality-insights-helper.js](#watson-personality-insights).

## Watson Personality Insights
Files associated:
* config/config.js
* helpers/personality-insights-helper.js

After the tweets are retrieved with the help of twitter api and passport, it is processed by personality-insights-helper.js. It processes the tweets to the format required by IBM Watson Personality Insights. To learn more about the parameters required, refer to the IBM Personality Insights documentation [here](https://www.ibm.com/watson/developercloud/personality-insights/api/v3/node.html?node). This [demo page](https://personality-insights-demo.ng.bluemix.net/) also provides great insights on how to combine the use of twitter api, passport and watson-personality-insights. Ultimately, they are all used by twitRouter.js to create a http api call used by Angular front end, which returns the personality of the user as analysed based on the user's tweets.

## MongoDB Models
Files associated:
* models/instruction.js
* models/start.js
* models/user.js

After connecting to mongoDB in app.js, the data models are initialised in the directory *models*. Such models will be used by SocketIO in *app.js* to save and return data saved in the database as per requested.

## Angular
Files associated:
* assets/app/*

Angular is responsible of rendering the front end, routing of different page (instead of the usual http method), and perform the game functions. To understand the code, it requires basic understanding of how Angular frontend framework works. It uses TypeScript, which is syntatically similar to JavaScript, except it is a strongly typed language. The routing is done by *app.routing.ts*, and the "modules" used will be declared in *app.module.ts*. 

The three main routes/web page are located in the directory *introduction*, *auth*, and *game*. The main functions are written in *\*.service.ts* file, and is called by *\*.component.ts* which is linked to the *\*.html* (and *\*.css*). The *Observable* used in Angular allows real-time function call whenever the data it is "observing" changes. This allows the game state to change without the need of manual user input, such as through a button, from the webpage. The function can be called whenever a data/instruction is "emitted" by the SocketIO (which is on the server, *bin/www*). 

# Suggestions for Improvements
The code could be better modularised for ease of readability. Due to time constraint, they are not written in the optimal way, such that:

1. The SocketIO could have been written in a separate file instead of in the *bin/www* file.
2. The redirect route by passport to "/introduction", as implemented in *routes/twitRouter* could have been done by Angular. A better API could be written such that a http get request is called to return the user credentials after successful login, and another http post request is called to post the user credentials to invoke Watson Personality Insights service. This allows http request entirely on Angular frontend, and after retrieving the personality json, it routes to the introduction page.
3. The functions written in *\*.service.ts* could be optimised/modularised. They are rather boilerplate right now (but works perfectly).
4. The game could be made entirely real-time instead of turn-based.