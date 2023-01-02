Caches responses from puppeteer
You should ONLY do this for html, js, css and fonts

```js
// if false then it saves based on domain and path(example: google.com/something)
// if true then it saves based on full url (example: google.com/something?another_thing=yes&ok=true)

let fullURL = false;

let cacher = require("puppeteer-cacher");
let CACHE = new cacher(fullURL);

// This memory stuff is optional
// if memoryStore is undefined it creates one by itself
// Only used if you want to store in a real database
// or to share memory with other browsers

let memory = {};

CACHE.memory = {
  get: (name) => {
    return new Promise((resolve, reject) => {
      resolve(memory[name]);
    });
  },
  set: (name, value) => {
    return new Promise((resolve, reject) => {
      memory[name] = value;
      resolve();
    });
  },
};

await page.setRequestInterception(true);

page.on("request", async (request) => {
  let type = request.resourceType();
  if (
    type == "document" ||
    type == "script" ||
    type == "font" ||
    type == "stylesheet"
  ) {
    CACHE.get(request, (result, wasFound) => {
      if (!wasFound) return request.continue();

      request.respond(result);
    });
  } else {
    request.continue();
  }
});

page.on("requestfinished", (request) => {
  let type = request.resourceType();
  if (
    type == "document" ||
    type == "script" ||
    type == "font" ||
    type == "stylesheet"
  ) {
    CACHE.save(request.response());
  }
});
```
