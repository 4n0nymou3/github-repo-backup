async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('Please enter a GitHub username.');
        return;
    }

    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const loadingEl = document.getElementById('loading');
    const batchDownloadEl = document.getElementById('batchDownload');
    
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
    batchDownloadEl.style.display = 'none';
    loadingEl.style.display = 'flex';

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?type=public&per_page=100`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found. Please check the username and try again.');
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        }
        
        const repos = await response.json();
        loadingEl.style.display = 'none';
        
        if (repos.length === 0) {
            repoHeaderEl.innerHTML = `
                <h3>Repositories for ${username}</h3>
                <span class="repo-count">0</span>
            `;
            repoListEl.innerHTML = '<p class="terminal-intro">No public repositories found.</p>';
            return;
        }

        // Sort repositories by update date (newest first)
        repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        repoHeaderEl.innerHTML = `
            <h3>Repositories for ${username}</h3>
            <span class="repo-count">${repos.length}</span>
        `;
        
        let repoHtml = '<div class="repo-list-container">';
        
        repos.forEach(repo => {
            const repoName = repo.name;
            const repoUrl = repo.html_url;
            const zipUrl = `${repoUrl}/archive/refs/heads/${repo.default_branch}.zip`;
            const updateDate = new Date(repo.updated_at).toLocaleDateString();
            
            repoHtml += `
                <div class="repo-item">
                    <div class="repo-name-container" title="${repoName}">${repoName}</div>
                    <div class="repo-info">
                        <span class="repo-date">Updated: ${updateDate}</span>
                        <div class="repo-actions">
                            <a href="${repoUrl}" target="_blank" class="glow-button secondary">
                                <i class="fas fa-code"></i>
                            </a>
                            <a href="${zipUrl}" download class="glow-button secondary">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        repoHtml += '</div>';
        repoListEl.innerHTML = repoHtml;
        
        // Add batch download button
        if (repos.length > 0) {
            batchDownloadEl.style.display = 'flex';
            batchDownloadEl.innerHTML = `
                <button onclick="downloadAllRepos('${username}', ${JSON.stringify(repos.map(repo => ({ 
                    name: repo.name, 
                    branch: repo.default_branch 
                })))})" class="glow-button success batch-download-button">
                    <i class="fas fa-cloud-download-alt button-icon"></i>
                    <span>Download All (${repos.length} Repositories)</span>
                </button>
            `;
        }
        
    } catch (error) {
        loadingEl.style.display = 'none';
        repoHeaderEl.innerHTML = '';
        repoListEl.innerHTML = `<p class="terminal-error"><i class="fas fa-exclamation-triangle"></i> ${error.message}</p>`;
    }
}

function showError(message) {
    const repoListEl = document.getElementById('repoList');
    repoListEl.innerHTML = `<p class="terminal-error"><i class="fas fa-exclamation-triangle"></i> ${message}</p>`;
}

function downloadAllRepos(username, repos) {
    if (!repos || repos.length === 0) return;
    
    const batchDownloadEl = document.getElementById('batchDownload');
    batchDownloadEl.innerHTML = `
        <button disabled class="glow-button warning batch-download-button">
            <i class="fas fa-spinner fa-spin button-icon"></i>
            <span>Preparing Downloads...</span>
        </button>
    `;
    
    // For each repo, create and click a hidden link to download it
    repos.forEach((repo, index) => {
        setTimeout(() => {
            const zipUrl = `https://github.com/${username}/${repo.name}/archive/refs/heads/${repo.branch}.zip`;
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `${repo.name}.zip`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Update button when all downloads are initiated
            if (index === repos.length - 1) {
                setTimeout(() => {
                    batchDownloadEl.innerHTML = `
                        <button onclick="downloadAllRepos('${username}', ${JSON.stringify(repos)})" class="glow-button success batch-download-button">
                            <i class="fas fa-cloud-download-alt button-icon"></i>
                            <span>Download All (${repos.length} Repositories)</span>
                        </button>
                    `;
                }, 3000);
            }
        }, index * 300); // Stagger downloads to avoid browser limitations
    });
}

// Add event listener for Enter key in the input field
document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('username');
    inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkRepositories();
        }
    });
});