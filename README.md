## Features
- List all public repositories of a GitHub user along with their count.
- Download individual public repositories as ZIP files.
- Download all listed repositories as a single consolidated ZIP file.

## Usage
1. Enter a GitHub username in the input field.
2. Click "Check Public Repositories" to list all public repositories.
3. Use the "Download ZIP" button next to each repository to download it individually.
4. Use the "Download All Repositories" button to download all repositories at once as a consolidated ZIP file.

## Cloudflare Worker Setup
For downloading all repositories, a Cloudflare Worker is used as a proxy to handle CORS issues and enable proper file retrieval. If you plan to fork this repository and deploy it, create a new Cloudflare Worker with the following code:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    
    if (!target) {
      return new Response("Missing url parameter", { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/plain"
        }
      });
    }
    
    const targetUrl = new URL(target);
    if (!targetUrl.hostname.endsWith('github.com')) {
      return new Response("Only GitHub URLs are allowed", { 
        status: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/plain"
        }
      });
    }
    
    const response = await fetch(target, {
      cf: {
        cacheTtl: 3600,
        cacheEverything: true,
      }
    });
    
    if (!response.ok) {
      return new Response(`Error fetching from GitHub: ${response.status}`, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/plain"
        }
      });
    }
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    
    return new Response(response.body, { 
      status: response.status, 
      headers: newHeaders 
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      }
    });
  }
}
```

After deploying the Worker, update the `WORKER_URL` constant in `js/download.js` with your Worker's URL.

## License
This project is licensed under the MIT License.

## Author
Created by [Anonymous](https://x.com/4n0nymou3)