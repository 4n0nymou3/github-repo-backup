async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('Please enter a GitHub username.');
        return;
    }

    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const loadingEl = document.getElementById('loading');
    
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
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

document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('username');
    inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkRepositories();
        }
    });
});