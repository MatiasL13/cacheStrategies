
var CACHE_STATIC_NAME = 'static-v6';
var CACHE_DYNAMIC_NAME = 'dynamic-v6';
var CACHE_ONLY = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll(CACHE_ONLY);
      })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});


// 2 Network only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );   
// });

//3 cache only
/* self.addEventListener('fetch', function(event) {
  event.respondWith(
  caches.match(event.request)
  );   
}); */

// 4) network  cache fallback to cache
//no funciona bien si hay conexion lenta
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//   fetch(event.request)
//     .then(function(res){
//       return caches.open(CACHE_DYNAMIC_NAME)
//         .then(function(cache){
//           cache.put(event.request.url, res.clone());
//           return res;
//         })
//     })
//     .catch(function(err){
//       return caches.match(event.request)
//     })
//   );   
// });

//5) cache, then network -- dynamic
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME)
//       .then(function(cache){
//         return fetch(event.request)
//           .then(function(res){
//             cache.put(res.url, res.clone());
//             return res;
//           })
//       })
//   );   
// });


// function isInArray(string, array){//v1
//   for (var i = 0; i < array.length; i++){
//     if(array[i] === string){
//       return true;
//     }
//   }
//   return false;
// }
function isInArray(string, array) { //v2
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

// 6)Routing
self.addEventListener('fetch', function(event) {
  if(event.request.url.indexOf('https://httpbin.org/ip') > -1)
  {//cache, then network -- dynamic
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function(cache){
          return fetch(event.request)
            .then(function(res){
              cache.put(event.request.url, res.clone());
              return res;
            })
        })
    );   
  }else if(isInArray(event.request.url, CACHE_ONLY)){//cache only
      event.respondWith(
      caches.match(event.request)
      );   
  }else{//cache fallback network
      event.respondWith(
        caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                .then(function(res) {
                  return caches.open(CACHE_DYNAMIC_NAME)
                    .then(function(cache) {
                      cache.put(event.request.url, res.clone());
                      return res;
                    });
                })
                .catch(function(err) {

                });
            }
          })
      );
  }
});


//  1)//cache fallback network
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 });
//             })
//             .catch(function(err) {

//             });
//         }
//       })
//   );
// });