const WORKER_URL = "https://git-zip-proxy.r612q.workers.dev/";

function crc32(buf) {
  const table = window.crcTable || (window.crcTable = (function() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[n] = c;
    }
    return table;
  })());
  
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function numToBytes(num, bytes) {
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    arr[i] = num & 0xFF;
    num = num >>> 8;
  }
  return arr;
}

function stringToBytes(str) {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function concatArrays(arrays) {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  arrays.forEach(arr => {
    result.set(arr instanceof Uint8Array ? arr : new Uint8Array(arr), offset);
    offset += arr.length;
  });
  return result;
}

async function downloadAllRepositories() {
  const links = document.querySelectorAll('a[title="Download ZIP"]');
  if (links.length === 0) {
    showError("No repositories available.");
    return;
  }
  
  const downloadAllButton = document.getElementById('download-all-button');
  const originalText = downloadAllButton.innerHTML;
  downloadAllButton.innerHTML = '<i class="fas fa-spinner fa-spin button-icon"></i><span>Downloading...</span>';
  downloadAllButton.disabled = true;
  
  const files = [];
  let errorOccurred = false;
  
  try {
    await Promise.all(Array.from(links).map(async (link, index) => {
      const repoItem = link.closest('.repo-item');
      const repoName = repoItem.querySelector('.repo-name-container').textContent.trim();
      const url = link.href;
      
      try {
        repoItem.style.backgroundColor = 'rgba(122, 162, 247, 0.1)';
        const workerUrl = `${WORKER_URL}?url=${encodeURIComponent(url)}`;
        
        const resp = await fetch(workerUrl);
        if (!resp.ok) throw new Error(`Failed to fetch ${repoName}`);
        
        const buf = new Uint8Array(await resp.arrayBuffer());
        files.push({name: `${repoName}.zip`, data: buf});
        
        repoItem.style.backgroundColor = 'rgba(115, 218, 202, 0.1)';
      } catch (err) {
        repoItem.style.backgroundColor = 'rgba(247, 118, 142, 0.1)';
        console.error(`Error downloading ${repoName}: ${err.message}`);
        errorOccurred = true;
      }
    }));
    
    if (errorOccurred) {
      if (files.length === 0) {
        throw new Error('Failed to download any repositories');
      } else if (!confirm(`Some repositories failed to download. Continue with ${files.length} successful downloads?`)) {
        throw new Error('Download cancelled');
      }
    }
    
    const zipData = createZip(files);
    const blob = new Blob([zipData], {type: "application/zip"});
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${document.getElementById('username').value.trim()}-repositories.zip`;
    downloadLink.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(downloadLink.href);
    }, 60000);
    
  } catch (error) {
    showError(error.message);
  } finally {
    downloadAllButton.innerHTML = originalText;
    downloadAllButton.disabled = false;
    
    setTimeout(() => {
      document.querySelectorAll('.repo-item').forEach(item => {
        item.style.backgroundColor = '';
      });
    }, 3000);
  }
}

function createZip(files) {
  const localFiles = [];
  const centralDirectory = [];
  let offset = 0;
  
  files.forEach(file => {
    const filenameBytes = stringToBytes(file.name);
    const crc = crc32(file.data);
    
    const localHeader = concatArrays([
      numToBytes(0x04034b50, 4),
      numToBytes(20, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(crc, 4),
      numToBytes(file.data.length, 4),
      numToBytes(file.data.length, 4),
      numToBytes(filenameBytes.length, 2),
      numToBytes(0, 2),
      filenameBytes
    ]);
    
    localFiles.push(localHeader);
    localFiles.push(file.data);
    
    const centralHeader = concatArrays([
      numToBytes(0x02014b50, 4),
      numToBytes(20, 2),
      numToBytes(20, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(crc, 4),
      numToBytes(file.data.length, 4),
      numToBytes(file.data.length, 4),
      numToBytes(filenameBytes.length, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 2),
      numToBytes(0, 4),
      numToBytes(offset, 4),
      filenameBytes
    ]);
    
    centralDirectory.push(centralHeader);
    offset += localHeader.length + file.data.length;
  });
  
  const centralData = concatArrays(centralDirectory);
  
  const eocd = concatArrays([
    numToBytes(0x06054b50, 4),
    numToBytes(0, 2),
    numToBytes(0, 2),
    numToBytes(files.length, 2),
    numToBytes(files.length, 2),
    numToBytes(centralData.length, 4),
    numToBytes(offset, 4),
    numToBytes(0, 2)
  ]);
  
  return concatArrays([concatArrays(localFiles), centralData, eocd]);
}

function showError(message) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  errorContainer.style.display = 'block';
  
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 5000);
}