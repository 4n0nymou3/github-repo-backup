function crc32(buf) {
  let table = window.crcTable || (window.crcTable = (function() {
    let c, table = [];
    for(let n =0; n < 256; n++){
      c = n;
      for(let k =0; k < 8; k++){
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[n] = c;
    }
    return table;
  })());
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++ ) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function numToBytes(num, bytes) {
  let arr = [];
  for(let i = 0; i < bytes; i++){
    arr.push(num & 0xFF);
    num = num >>> 8;
  }
  return arr;
}

function stringToBytes(str) {
  let arr = [];
  for(let i = 0; i < str.length; i++){
    arr.push(str.charCodeAt(i));
  }
  return arr;
}

function concatArrays(arrays) {
  let totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  let result = new Uint8Array(totalLength);
  let offset = 0;
  arrays.forEach(arr => {
    result.set(arr, offset);
    offset += arr.length;
  });
  return result;
}

async function downloadAllRepositories() {
  const links = document.querySelectorAll('a[title="Download ZIP"]');
  if (links.length === 0) { alert("No repositories available."); return; }
  let files = [];
  for (let link of links) {
    let repoName = link.closest('.repo-item').querySelector('.repo-name-container').textContent.trim();
    let url = link.href;
    let resp = await fetch(url);
    let buf = new Uint8Array(await resp.arrayBuffer());
    files.push({name: repoName + ".zip", data: buf});
  }
  let zipData = createZip(files);
  let blob = new Blob([zipData], {type: "application/zip"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "repositories.zip";
  a.click();
}

function createZip(files) {
  let localFiles = [];
  let centralDirectory = [];
  let offset = 0;
  files.forEach(file => {
    let filenameBytes = stringToBytes(file.name);
    let crc = crc32(file.data);
    let localHeader = [].concat(
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
    );
    let localHeaderArr = new Uint8Array(localHeader);
    localFiles.push(localHeaderArr);
    localFiles.push(file.data);
    let centralHeader = [].concat(
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
      numToBytes(offset, 4),
      filenameBytes
    );
    centralDirectory.push(new Uint8Array(centralHeader));
    offset += localHeaderArr.length + file.data.length;
  });
  let centralData = concatArrays(centralDirectory);
  let eocd = [].concat(
    numToBytes(0x06054b50, 4),
    numToBytes(0, 2),
    numToBytes(0, 2),
    numToBytes(files.length, 2),
    numToBytes(files.length, 2),
    numToBytes(centralData.length, 4),
    numToBytes(offset, 4),
    numToBytes(0, 2)
  );
  let eocdArr = new Uint8Array(eocd);
  return concatArrays([concatArrays(localFiles), centralData, eocdArr]);
    }
