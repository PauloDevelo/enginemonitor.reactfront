This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Status of integration branch ![integration environment for github](https://github.com/PauloDevelo/enginemonitor.reactfront/workflows/CI/badge.svg?branch=integration)
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm start-sw`

Runs the app locally in the production mode using http-server.<br>
The page will not reload if you make edits. You need to build the app to see your changes.<br>
This allows to test the service worker.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm coverage`
Run the test and display the coverage at the end.

### `npm run build`

First, it sort alphabetically all the json files containing messages for the components.
Then, all the messages in the json files are checked to be sure a translation exists in english and french.
Then, all the unit tests are run.
Then, the meta.json file containing the version number from the package.json file is generated.

And finally, after all the previous steps were executed successfully, it builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run just-build`
This script just build the application without running the test, sort the json files, and check the translations.

### `npm deploy`
Deploy the production build on a distant server.

### `npm rollback`
Rollback the current release on the distant server and put back the previous release instead.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
