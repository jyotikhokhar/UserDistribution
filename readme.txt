1. install dependencies by running command npm install
2. start mongo db on port 27017
3. start the server using command npm start
4. access the application at localhost:3000
5. upload json file and wait for the confirmation of data upload
6. the map will be loaded with markers.
7. levels wont be shown on each zoom in or zoom out, rather it is adjusted according to the view in the map
   e.g country will be shown from 1 to 4 level, state will be shown from 5 to 7 level and so on.
   so basically to see the one level down/up you may have to zoom in/out 2-3 times.


Optimization:
1. As there is limit to google map geolocation api, storing the longitute and latitude in db if not already there.
