async function checkRepositories() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('Please enter a GitHub username.');
        return;
    }

    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const loadingEl = document.getElementById('loading');
    const clearButton = document.getElementById('clear-button');
    const searchContainer = document.getElementById('searchContainer');
    
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
    loadingEl.style.display = 'flex';
    clearButton.style.display = 'flex';
    searchContainer.style.display = 'none';

    try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.avatar_url) {
                document.getElementById('default-avatar').style.display = 'none';
                const profileAvatar = document.getElementById('profile-avatar');
                profileAvatar.src = userData.avatar_url;
                profileAvatar.style.display = 'block';
            }
        }

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
        
        searchContainer.style.display = 'block';
        const search barsInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const repoItems = document.querySelectorAll('.repo-item');
            repoItems.forEach(item => {
                const repoName = item.querySelector('.repo-name-container').textContent.toLowerCase();
                if (repoName.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        let repoHtml = '<div class="repo-list-container">';
        
        repos.forEach(repo => {
            const repoName = repo.name;
            const repoUrl = repo.html_url;
            const zipUrl = `${repoUrl}/archive/refs/heads/${repo.default_branch}.zip`;
            const updateDate = new Date(repo.updated_at).toLocaleDateString();
            const createDate = new Date(repo.created_at).toLocaleDateString();
            const stars = repo.stargazers_count;
            const forks = repo.forks_count;
            
            repoHtml += `
                <div class="repo-item">
                    <div class="repo-name-container" title="${repoName}">${repoName}</div>
                    <div class="repo-info">
                        <span class="repo-date">Created: ${createDate} | Updated: ${updateDate}</span>
                        <div class="repo-stats">
                            <span><i class="fas fa-star"></i> ${stars}</span>
                            <span><i class="fas fa-code-branch"></i> ${forks}</span>
                        </div>
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

function resetEverything() {
    const username = document.getElementById('username');
    const repoHeaderEl = document.getElementById('repoHeader');
    const repoListEl = document.getElementById('repoList');
    const defaultAvatar = document.getElementById('default-avatar');
    const profileAvatar = document.getElementById('profile-avatar');
    const clearButton = document.getElementById('clear-button');
    const searchContainer = document.getElementById('searchContainer');
    
    username.value = '';
    repoHeaderEl.innerHTML = '';
    repoListEl.innerHTML = '';
    searchContainer.style.display = 'none';
    
    defaultAvatar.style.display = 'block';
    profileAvatar.style.display = 'none';
    profileAvatar.src = '';
    
    clearButton.style.display = 'none';
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